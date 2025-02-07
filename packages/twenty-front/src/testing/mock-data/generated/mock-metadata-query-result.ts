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
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "YXJyYXljb25uZWN0aW9uOjA=",
      endCursor: "YXJyYXljb25uZWN0aW9uOjM4"
    },
    edges: [
      {
        node: {
          id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "timelineActivity",
          namePlural: "timelineActivities",
          icon: "IconTimelineEvent",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "aab81319-df26-4a0a-a7f9-e029860e3380",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Timeline Activity",
          labelPlural: "Timeline Activities",
          description: "Aggregated / filtered event to be displayed on the timeline",
          fieldsList: [
            {
              id: "aa3b1375-a29f-4518-9b6a-1cd23fd36545",
              type: "DATE_TIME",
              name: "happensAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "18215e6e-6b3f-4633-ad2e-dd1842c91636",
              type: "TEXT",
              name: "name",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Event name",
              description: "Event name"
            },
            {
              id: "3f2d4f7b-7a35-4efa-912c-a92137aa229d",
              type: "RAW_JSON",
              name: "properties",
              icon: "IconListDetails",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Event details",
              description: "Json value for event details"
            },
            {
              id: "9b996ab3-ade8-4a58-ab50-74de9eb00a0e",
              type: "TEXT",
              name: "linkedRecordCachedName",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Linked Record cached name",
              description: "Cached record name"
            },
            {
              id: "8883ef0d-8f60-497e-88f5-c7835c0c155b",
              type: "UUID",
              name: "linkedRecordId",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Linked Record id",
              description: "Linked Record id"
            },
            {
              id: "4fa240c4-107e-4656-8aa4-a02ba6618c60",
              type: "UUID",
              name: "linkedObjectMetadataId",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Linked Object Metadata Id",
              description: "Linked Object Metadata Id"
            },
            {
              id: "aab81319-df26-4a0a-a7f9-e029860e3380",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "1dbceb1c-0a57-4a69-a691-925e81106b78",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "fc4881f2-884a-48b3-a6b5-8c393e191981",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "1c2b9ecb-b90d-46bb-8ba9-11d22cfdc6d2",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "71a7cf9c-0159-4d15-bc88-fd2395793328",
              type: "UUID",
              name: "workspaceMemberId",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Workspace Member id (foreign key)",
              description: "Event workspace member id foreign key"
            },
            {
              id: "4357f9a6-ffa4-4cc8-bf3c-b91fa6ce6dc0",
              type: "RELATION",
              name: "workspaceMember",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              label: "Workspace Member",
              description: "Event workspace member",
              relationDefinition: {
                relationId: "833db5c6-218e-4b7e-9bb9-4a2f9fa0190f",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  id: "4357f9a6-ffa4-4cc8-bf3c-b91fa6ce6dc0",
                  name: "workspaceMember"
                },
                targetObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  id: "7bb66a23-8ecf-4f7d-95ee-9650ed76c38d",
                  name: "timelineActivities"
                }
              }
            },
            {
              id: "d9c8cc02-e070-4205-be03-e3ad5d55541a",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "Event person id foreign key"
            },
            {
              id: "d7ac6093-849f-4c92-87e9-93ec5c63e274",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              label: "Person",
              description: "Event person",
              relationDefinition: {
                relationId: "9017d7a8-2ae5-4dbe-8907-a663b980c2a2",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  id: "d7ac6093-849f-4c92-87e9-93ec5c63e274",
                  name: "person"
                },
                targetObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  id: "ff392398-e031-426f-867f-6cbfbf5937c2",
                  name: "timelineActivities"
                }
              }
            },
            {
              id: "3d7f5811-1658-44f5-8c20-57ccf4a9df62",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "Event company id foreign key"
            },
            {
              id: "5e6b1a44-04cb-41eb-a521-16896dc31741",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              label: "Company",
              description: "Event company",
              relationDefinition: {
                relationId: "11bf28ea-da71-400b-886f-af41500c8a2d",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  id: "5e6b1a44-04cb-41eb-a521-16896dc31741",
                  name: "company"
                },
                targetObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  id: "4530929a-e628-4b9c-a6c9-20d62d325d50",
                  name: "timelineActivities"
                }
              }
            },
            {
              id: "bd1a0a3b-ec10-47d7-85b1-03d6957c9d97",
              type: "UUID",
              name: "opportunityId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Opportunity id (foreign key)",
              description: "Event opportunity id foreign key"
            },
            {
              id: "29299a5d-d4b6-4e21-9778-4a2ad05e2d8a",
              type: "RELATION",
              name: "opportunity",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              label: "Opportunity",
              description: "Event opportunity",
              relationDefinition: {
                relationId: "3dcefe3e-7ebb-4cf6-92b8-0989fdd0fb91",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  id: "29299a5d-d4b6-4e21-9778-4a2ad05e2d8a",
                  name: "opportunity"
                },
                targetObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  id: "cd8cc64a-22f0-46b1-9adf-0b5da3e74bd2",
                  name: "timelineActivities"
                }
              }
            },
            {
              id: "457f7554-ffe7-4878-822c-28560a582161",
              type: "UUID",
              name: "noteId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Note id (foreign key)",
              description: "Event note id foreign key"
            },
            {
              id: "f26b4e6e-5bba-420b-8f02-735e191bcf96",
              type: "RELATION",
              name: "note",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              label: "Note",
              description: "Event note",
              relationDefinition: {
                relationId: "99efb0ac-4af8-47a6-a28a-e1b66aa06b62",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  id: "f26b4e6e-5bba-420b-8f02-735e191bcf96",
                  name: "note"
                },
                targetObjectMetadata: {
                  id: "11404ff2-0997-45dc-8efd-6ba08c12e150",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                targetFieldMetadata: {
                  id: "98343f95-7245-44b5-92ff-18b8a11384f4",
                  name: "timelineActivities"
                }
              }
            },
            {
              id: "d0adae94-c67a-4ce9-a752-be82ad244a7b",
              type: "UUID",
              name: "taskId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Task id (foreign key)",
              description: "Event task id foreign key"
            },
            {
              id: "adfea4d4-656c-428e-b003-c17725ec718c",
              type: "RELATION",
              name: "task",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              label: "Task",
              description: "Event task",
              relationDefinition: {
                relationId: "9b455a41-1050-4906-823c-93a0330b7289",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  id: "adfea4d4-656c-428e-b003-c17725ec718c",
                  name: "task"
                },
                targetObjectMetadata: {
                  id: "24c7b746-68be-40da-8189-8b7ace3d09c8",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                targetFieldMetadata: {
                  id: "30e49cbc-8c2e-4c39-be1a-5af522a8e71d",
                  name: "timelineActivities"
                }
              }
            },
            {
              id: "daae28f3-338b-4be2-9457-fd05a588b044",
              type: "UUID",
              name: "workflowId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "Event workflow id foreign key"
            },
            {
              id: "df92ef09-8e90-4385-aefd-4c1b4980aaf6",
              type: "RELATION",
              name: "workflow",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              label: "Workflow",
              description: "Event workflow",
              relationDefinition: {
                relationId: "f7bf5cdb-5fc6-4a2d-9b2b-f67c0173c0a8",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  id: "df92ef09-8e90-4385-aefd-4c1b4980aaf6",
                  name: "workflow"
                },
                targetObjectMetadata: {
                  id: "086e4ff9-7a55-4974-9756-710f2f46425c",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                targetFieldMetadata: {
                  id: "fe54e4c9-aa25-40ae-9890-fec0807c07a5",
                  name: "timelineActivities"
                }
              }
            },
            {
              id: "5e538b61-db81-45d3-ae54-14258ee19043",
              type: "UUID",
              name: "workflowVersionId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "WorkflowVersion id (foreign key)",
              description: "Event workflow version id foreign key"
            },
            {
              id: "3c11dd63-921b-46cc-93c1-7bbbf1f89285",
              type: "RELATION",
              name: "workflowVersion",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              label: "WorkflowVersion",
              description: "Event workflow version",
              relationDefinition: {
                relationId: "b12e4f3b-8a0f-4099-9c9a-2bb4d1e8941c",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  id: "3c11dd63-921b-46cc-93c1-7bbbf1f89285",
                  name: "workflowVersion"
                },
                targetObjectMetadata: {
                  id: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                targetFieldMetadata: {
                  id: "cb1b748f-dd70-4303-8100-e73efd57538f",
                  name: "timelineActivities"
                }
              }
            },
            {
              id: "66e0a7a2-db3d-4c1a-9cd1-acb014f84b70",
              type: "UUID",
              name: "workflowRunId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Workflow Run id (foreign key)",
              description: "Event workflow run id foreign key"
            },
            {
              id: "6704a8e8-4ed9-48e7-a899-ebcdb55979c2",
              type: "RELATION",
              name: "workflowRun",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              label: "Workflow Run",
              description: "Event workflow run",
              relationDefinition: {
                relationId: "633a96de-a16b-4da9-a1ac-a794c8f1406f",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  id: "6704a8e8-4ed9-48e7-a899-ebcdb55979c2",
                  name: "workflowRun"
                },
                targetObjectMetadata: {
                  id: "c722cbde-6aaf-4128-aa90-bb142b40408e",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                targetFieldMetadata: {
                  id: "c6b6bc99-6dd9-4c06-a79f-9b2870fcfc63",
                  name: "timelineActivities"
                }
              }
            },
            {
              id: "0504f5b6-08ee-43d1-849e-c63de4591a4e",
              type: "RELATION",
              name: "pet",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.270Z",
              updatedAt: "2025-02-07T10:58:03.270Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              label: "Pet",
              description: "TimelineActivities Pet",
              relationDefinition: {
                relationId: "05c73e13-8d6a-47e7-8ee1-3d8d7575a34f",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  id: "0504f5b6-08ee-43d1-849e-c63de4591a4e",
                  name: "pet"
                },
                targetObjectMetadata: {
                  id: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                targetFieldMetadata: {
                  id: "c2c6804f-ec5d-47af-b1c3-9c34ccc65d31",
                  name: "timelineActivities"
                }
              }
            },
            {
              id: "50667976-3d48-48b6-a854-30f6b45cbd28",
              type: "UUID",
              name: "petId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.270Z",
              updatedAt: "2025-02-07T10:58:03.270Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Pet ID (foreign key)",
              description: "Timeline Activity Pet id foreign key"
            },
            {
              id: "ba8f152e-aeb0-4c8b-96ac-e64938078027",
              type: "RELATION",
              name: "surveyResult",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.975Z",
              updatedAt: "2025-02-07T10:58:03.975Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              label: "Survey result",
              description: "TimelineActivities Survey result",
              relationDefinition: {
                relationId: "fc52b0b9-97f8-446b-8e5f-8a3041cc1760",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                sourceFieldMetadata: {
                  id: "ba8f152e-aeb0-4c8b-96ac-e64938078027",
                  name: "surveyResult"
                },
                targetObjectMetadata: {
                  id: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                targetFieldMetadata: {
                  id: "ddef1b52-93c7-40d3-b44e-68452fd1ce10",
                  name: "timelineActivities"
                }
              }
            },
            {
              id: "822c9ecd-c8ee-424d-a4c5-b201c3b25632",
              type: "UUID",
              name: "surveyResultId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.975Z",
              updatedAt: "2025-02-07T10:58:03.975Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
              relationDefinition: null,
              label: "Survey result ID (foreign key)",
              description: "Timeline Activity Survey result id foreign key"
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "844d93ad-9417-4206-be5a-18497d241ba9",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_daf6592d1dff4cff3401bf23c67",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "af2b85b9-e668-479a-8315-dc7e22a90176",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "1c2b9ecb-b90d-46bb-8ba9-11d22cfdc6d2"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "4d56a4e0-7b9d-49bc-ba40-ac217123ec54",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_6eae0c4202a87f812adf2f2ba6f",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "fee28509-f11d-4c8b-a5b2-eb679d6e9606",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "1c2b9ecb-b90d-46bb-8ba9-11d22cfdc6d2"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "259cb0b5-7652-43b0-a452-614ef8da553e",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_a98bc2277b52c6dd52303e52c21",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "98dd09e4-b035-4bcb-b650-c8cad6f00487",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "1c2b9ecb-b90d-46bb-8ba9-11d22cfdc6d2"
                        }
                      },
                      {
                        node: {
                          id: "741c382b-1794-4044-98e9-b7e569b14ca0",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "457f7554-ffe7-4878-822c-28560a582161"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "a24c3089-b461-4e35-9c2d-3240ace119bb",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_7e0d952730f13369e3bd9c2f1a9",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "98a6cc1a-18bb-44d1-bcb3-44a207c74d79",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "1c2b9ecb-b90d-46bb-8ba9-11d22cfdc6d2"
                        }
                      },
                      {
                        node: {
                          id: "edac0f8f-acf1-4b5b-b57d-6bb0866528a4",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "bd1a0a3b-ec10-47d7-85b1-03d6957c9d97"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "95a25d4f-7167-4cc5-8005-f0d08e3dc756",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_4e40a441ad75df16dd71499529a",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "2bd46d8a-9b99-4778-97e1-d05c2b47ee73",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "5e538b61-db81-45d3-ae54-14258ee19043"
                        }
                      },
                      {
                        node: {
                          id: "b6110683-deeb-4809-88b9-13b5fdc7ab0d",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "1c2b9ecb-b90d-46bb-8ba9-11d22cfdc6d2"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "3381b24f-0239-4415-b115-3bf4802ab1f8",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_2708a99873421942c99ab94da12",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "6853adff-a218-4c1e-b7cd-56221a53c4e9",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "1c2b9ecb-b90d-46bb-8ba9-11d22cfdc6d2"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "51d762ba-cdd6-4962-991f-d66ec0b3f156",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_b292fe34a9e2d55884febd07e93",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "71cf1ff9-fb27-4bad-afb3-d253b5cf9912",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "1c2b9ecb-b90d-46bb-8ba9-11d22cfdc6d2"
                        }
                      },
                      {
                        node: {
                          id: "0fafda54-30af-4908-ada7-98a937ac9634",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "d0adae94-c67a-4ce9-a752-be82ad244a7b"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "b5acc9c7-52eb-4e46-b2ca-7cef2335a211",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_a930d316a6b4f3b81d3f026dd16",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "dac4d880-0750-4750-95ae-49f46ca05b9b",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "71a7cf9c-0159-4d15-bc88-fd2395793328"
                        }
                      },
                      {
                        node: {
                          id: "b7d1fef8-e94c-4839-ae78-6c8d4bbd92de",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "1c2b9ecb-b90d-46bb-8ba9-11d22cfdc6d2"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "dab8eac7-e46a-4f23-ae6f-e47675a2eaa2",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_84b1e01cb0480e514a6e7ec0095",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "3bee7215-e544-4eb1-a8ba-e4e7eddfbe83",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "3d7f5811-1658-44f5-8c20-57ccf4a9df62"
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
        node: {
          id: "f205d335-c203-4aff-b911-fe03266f5151",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "viewFilter",
          namePlural: "viewFilters",
          icon: "IconFilterBolt",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "6844236a-3de4-4bb1-ac7f-ca22f9d97657",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "View Filter",
          labelPlural: "View Filters",
          description: "(System) View Filters",
          fieldsList: [
            {
              id: "c4e46a2d-6609-49b8-bf82-720b8b469ea4",
              type: "UUID",
              name: "fieldMetadataId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f205d335-c203-4aff-b911-fe03266f5151",
              relationDefinition: null,
              label: "Field Metadata Id",
              description: "View Filter target field"
            },
            {
              id: "7ba7ca7e-6017-4ff4-a946-8e17a8280b21",
              type: "TEXT",
              name: "operand",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'Contains'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f205d335-c203-4aff-b911-fe03266f5151",
              relationDefinition: null,
              label: "Operand",
              description: "View Filter operand"
            },
            {
              id: "ee3daa1e-8a26-4e09-9d99-5d9bd1be371c",
              type: "TEXT",
              name: "value",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f205d335-c203-4aff-b911-fe03266f5151",
              relationDefinition: null,
              label: "Value",
              description: "View Filter value"
            },
            {
              id: "32c44a68-bba6-4d8e-a458-25badaf4e1c7",
              type: "TEXT",
              name: "displayValue",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f205d335-c203-4aff-b911-fe03266f5151",
              relationDefinition: null,
              label: "Display Value",
              description: "View Filter Display Value"
            },
            {
              id: "dcf04095-362f-494e-bb29-b0e237a61dff",
              type: "UUID",
              name: "viewFilterGroupId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f205d335-c203-4aff-b911-fe03266f5151",
              relationDefinition: null,
              label: "View Filter Group Id",
              description: "View Filter Group"
            },
            {
              id: "7ed0d858-b602-49a2-996a-d7c9bdb07351",
              type: "POSITION",
              name: "positionInViewFilterGroup",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f205d335-c203-4aff-b911-fe03266f5151",
              relationDefinition: null,
              label: "Position in view filter group",
              description: "Position in the view filter group"
            },
            {
              id: "6844236a-3de4-4bb1-ac7f-ca22f9d97657",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f205d335-c203-4aff-b911-fe03266f5151",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "180ceb9b-b2f2-4665-86a3-184e262607a0",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "f205d335-c203-4aff-b911-fe03266f5151",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "02855400-9f1a-4b93-9a3a-c1d8a468fc11",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "f205d335-c203-4aff-b911-fe03266f5151",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "4ab9d6f8-e09a-4c22-8cf0-56bc0fc3d373",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "f205d335-c203-4aff-b911-fe03266f5151",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "d6461a26-c520-4d72-90be-5d06dc8c66a8",
              type: "UUID",
              name: "viewId",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f205d335-c203-4aff-b911-fe03266f5151",
              relationDefinition: null,
              label: "View id (foreign key)",
              description: "View Filter related view id foreign key"
            },
            {
              id: "8b94d72d-00b0-4ef6-8d6f-2653d8fa369b",
              type: "RELATION",
              name: "view",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "f205d335-c203-4aff-b911-fe03266f5151",
              label: "View",
              description: "View Filter related view",
              relationDefinition: {
                relationId: "e48b6f4c-4f27-4703-8fbe-b5ac2428e8e7",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "f205d335-c203-4aff-b911-fe03266f5151",
                  nameSingular: "viewFilter",
                  namePlural: "viewFilters"
                },
                sourceFieldMetadata: {
                  id: "8b94d72d-00b0-4ef6-8d6f-2653d8fa369b",
                  name: "view"
                },
                targetObjectMetadata: {
                  id: "bf29268e-6c8e-48db-98a8-994f2931011e",
                  nameSingular: "view",
                  namePlural: "views"
                },
                targetFieldMetadata: {
                  id: "07f7d681-4b18-40de-ba6a-08296acf4ec4",
                  name: "viewFilters"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "f0cc3dc1-e493-4130-9a10-07e893a8835b",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_5653b106ee9a9e3d5c1c790419a",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: []
                  }
                }
              }
            ]
          }
        }
      },
      {
        node: {
          id: "efd63ec8-5b7a-4198-8db1-6e822d4ca406",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "viewFilterGroup",
          namePlural: "viewFilterGroups",
          icon: "IconFilterBolt",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "0460c5fa-a47b-46c6-a304-525a0a11fb64",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "View Filter Group",
          labelPlural: "View Filter Groups",
          description: "(System) View Filter Groups",
          fieldsList: [
            {
              id: "6c2ae5b5-7ee4-48cd-ac1c-37d4217b800c",
              type: "UUID",
              name: "parentViewFilterGroupId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "efd63ec8-5b7a-4198-8db1-6e822d4ca406",
              relationDefinition: null,
              label: "Parent View Filter Group Id",
              description: "Parent View Filter Group"
            },
            {
              id: "2ef70f6b-d03a-4e1d-9bbf-a8ebbaaa22de",
              type: "SELECT",
              name: "logicalOperator",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'NOT'",
              options: [
                {
                  id: "ed9624ec-c225-475a-b5a1-ee26e9c1c54d",
                  color: "blue",
                  label: "AND",
                  value: "AND",
                  position: 0
                },
                {
                  id: "2f6f6b9b-892c-43fb-8c53-09ed1dcefb5d",
                  color: "green",
                  label: "OR",
                  value: "OR",
                  position: 1
                },
                {
                  id: "44539246-c503-454a-8576-34ed0c7813bf",
                  color: "red",
                  label: "NOT",
                  value: "NOT",
                  position: 2
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "efd63ec8-5b7a-4198-8db1-6e822d4ca406",
              relationDefinition: null,
              label: "Logical Operator",
              description: "Logical operator for the filter group"
            },
            {
              id: "818ddd2a-cd07-40fd-8813-736e1fe44d9a",
              type: "POSITION",
              name: "positionInViewFilterGroup",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "efd63ec8-5b7a-4198-8db1-6e822d4ca406",
              relationDefinition: null,
              label: "Position in view filter group",
              description: "Position in the parent view filter group"
            },
            {
              id: "0460c5fa-a47b-46c6-a304-525a0a11fb64",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "efd63ec8-5b7a-4198-8db1-6e822d4ca406",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "7fcf431b-0a6c-4584-b3da-2d6dc4e03f0e",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "efd63ec8-5b7a-4198-8db1-6e822d4ca406",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "a0c66990-65a3-4c93-a512-c5453b73b3bf",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "efd63ec8-5b7a-4198-8db1-6e822d4ca406",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "53193ee0-e906-4d47-8179-9b1d4ef340dc",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "efd63ec8-5b7a-4198-8db1-6e822d4ca406",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "5151c5cc-d1db-4b02-a60f-2084d644a308",
              type: "UUID",
              name: "viewId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "efd63ec8-5b7a-4198-8db1-6e822d4ca406",
              relationDefinition: null,
              label: "View id (foreign key)",
              description: "View id foreign key"
            },
            {
              id: "08eccaf2-6956-48f1-98fb-e042cefc654b",
              type: "RELATION",
              name: "view",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "efd63ec8-5b7a-4198-8db1-6e822d4ca406",
              label: "View",
              description: "View",
              relationDefinition: {
                relationId: "57f2a9a9-a07f-411a-bff3-5db696e068f5",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "efd63ec8-5b7a-4198-8db1-6e822d4ca406",
                  nameSingular: "viewFilterGroup",
                  namePlural: "viewFilterGroups"
                },
                sourceFieldMetadata: {
                  id: "08eccaf2-6956-48f1-98fb-e042cefc654b",
                  name: "view"
                },
                targetObjectMetadata: {
                  id: "bf29268e-6c8e-48db-98a8-994f2931011e",
                  nameSingular: "view",
                  namePlural: "views"
                },
                targetFieldMetadata: {
                  id: "71ecd6d8-d240-4056-ac51-9514812fec43",
                  name: "viewFilterGroups"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "eae3e383-440f-4bda-8696-4c8f33f65f44",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_64ce6940a9464cd62484d52fb08",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "49bd326a-67f0-430b-a749-0a0ee28cfeb4",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "5151c5cc-d1db-4b02-a60f-2084d644a308"
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
        node: {
          id: "db7251bc-9ab2-425f-90f9-0755b34a769a",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "blocklist",
          namePlural: "blocklists",
          icon: "IconForbid2",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "393828be-bd65-4121-8aef-725ac0e62397",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Blocklist",
          labelPlural: "Blocklists",
          description: "Blocklist",
          fieldsList: [
            {
              id: "393828be-bd65-4121-8aef-725ac0e62397",
              type: "TEXT",
              name: "handle",
              icon: "IconAt",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "db7251bc-9ab2-425f-90f9-0755b34a769a",
              relationDefinition: null,
              label: "Handle",
              description: "Handle"
            },
            {
              id: "2076e43c-004b-4b22-ae0f-3b398a54d63c",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "db7251bc-9ab2-425f-90f9-0755b34a769a",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "e15dc856-49e5-44ee-b538-b9a81ea3ad20",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "db7251bc-9ab2-425f-90f9-0755b34a769a",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "f8130926-4d94-46e5-a101-74403e2d03cb",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "db7251bc-9ab2-425f-90f9-0755b34a769a",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "877c3645-043d-4e7a-a2f6-c057b5965e75",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "db7251bc-9ab2-425f-90f9-0755b34a769a",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "945a9bf5-6d54-4375-b248-6b162e04566c",
              type: "UUID",
              name: "workspaceMemberId",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "db7251bc-9ab2-425f-90f9-0755b34a769a",
              relationDefinition: null,
              label: "WorkspaceMember id (foreign key)",
              description: "WorkspaceMember id foreign key"
            },
            {
              id: "f4110ff0-24bf-4b3f-82a9-8319f95e30ff",
              type: "RELATION",
              name: "workspaceMember",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "db7251bc-9ab2-425f-90f9-0755b34a769a",
              label: "WorkspaceMember",
              description: "WorkspaceMember",
              relationDefinition: {
                relationId: "b9e9ac3a-6aef-4abb-8a87-95a9f7c1a85a",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "db7251bc-9ab2-425f-90f9-0755b34a769a",
                  nameSingular: "blocklist",
                  namePlural: "blocklists"
                },
                sourceFieldMetadata: {
                  id: "f4110ff0-24bf-4b3f-82a9-8319f95e30ff",
                  name: "workspaceMember"
                },
                targetObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  id: "d23ff3ad-feab-469a-8e68-64ac636fe62a",
                  name: "blocklist"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "e657d9fd-b1e6-430f-b0e4-d91b21ea51d4",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_76a190ab8a6f439791358d63d60",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "a5405a47-247d-416b-becf-4d80ca045154",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "945a9bf5-6d54-4375-b248-6b162e04566c"
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
        node: {
          id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "workspaceMember",
          namePlural: "workspaceMembers",
          icon: "IconUserCircle",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "ffd21fe1-5e16-4da3-b900-f062fa143944",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Workspace Member",
          labelPlural: "Workspace Members",
          description: "A workspace member",
          fieldsList: [
            {
              id: "ffd21fe1-5e16-4da3-b900-f062fa143944",
              type: "FULL_NAME",
              name: "name",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                lastName: "''",
                firstName: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "Name",
              description: "Workspace member name"
            },
            {
              id: "432f02a4-0768-4a66-8a33-8fdfffef689c",
              type: "TEXT",
              name: "colorScheme",
              icon: "IconColorSwatch",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'System'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "Color Scheme",
              description: "Preferred color scheme"
            },
            {
              id: "d48f290f-e8a2-448d-bb1b-58c4b4437660",
              type: "TEXT",
              name: "locale",
              icon: "IconLanguage",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'en'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "Language",
              description: "Preferred language"
            },
            {
              id: "7b51fd5f-0711-4f62-9c1b-843a5e716d0f",
              type: "TEXT",
              name: "avatarUrl",
              icon: "IconFileUpload",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "Avatar Url",
              description: "Workspace member avatar"
            },
            {
              id: "5c1de512-b62a-4c65-b732-1fab3b5b8922",
              type: "TEXT",
              name: "userEmail",
              icon: "IconMail",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "User Email",
              description: "Related user email address"
            },
            {
              id: "40f83e55-4590-4520-b724-6624ade74fa0",
              type: "UUID",
              name: "userId",
              icon: "IconCircleUsers",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "User Id",
              description: "Associated User Id"
            },
            {
              id: "1261babd-ff7e-40dc-90d8-9cd6561a86dc",
              type: "TEXT",
              name: "timeZone",
              icon: "IconTimezone",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'system'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "Time zone",
              description: "User time zone"
            },
            {
              id: "f59d055d-2f69-4e48-8471-a912de649efe",
              type: "SELECT",
              name: "dateFormat",
              icon: "IconCalendarEvent",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'SYSTEM'",
              options: [
                {
                  id: "3b55652c-5638-49a7-bf84-4678b1ccafc6",
                  color: "turquoise",
                  label: "System",
                  value: "SYSTEM",
                  position: 0
                },
                {
                  id: "7cd61caa-2f55-4a33-8c0e-95b887c036c5",
                  color: "red",
                  label: "Month First",
                  value: "MONTH_FIRST",
                  position: 1
                },
                {
                  id: "47df9a65-5784-4206-98ae-02e91e9d9219",
                  color: "purple",
                  label: "Day First",
                  value: "DAY_FIRST",
                  position: 2
                },
                {
                  id: "f38e49b4-46e4-4666-a7e7-bb507fa7167d",
                  color: "sky",
                  label: "Year First",
                  value: "YEAR_FIRST",
                  position: 3
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "Date format",
              description: "User's preferred date format"
            },
            {
              id: "640f5242-fe90-469f-9655-eb232618271e",
              type: "SELECT",
              name: "timeFormat",
              icon: "IconClock2",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'SYSTEM'",
              options: [
                {
                  id: "3a24b2ee-fb66-4fc1-b155-56918459c375",
                  color: "sky",
                  label: "System",
                  value: "SYSTEM",
                  position: 0
                },
                {
                  id: "9791d559-ad99-4746-8548-4872123ea3ba",
                  color: "red",
                  label: "24HRS",
                  value: "HOUR_24",
                  position: 1
                },
                {
                  id: "87f73d8d-8c47-4b7b-a1d7-98a33704d32a",
                  color: "purple",
                  label: "12HRS",
                  value: "HOUR_12",
                  position: 2
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "Time format",
              description: "User's preferred time format"
            },
            {
              id: "078c620c-843e-4014-ab61-f8027d1ec638",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              id: "c9e811c1-8857-4f59-8d8b-53317b989f9f",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "426341cb-8c4b-488c-a826-4e04823ec6bb",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "c79b80ae-6d79-4871-80e0-be117da3c42f",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "9d3afae2-435b-4070-ad29-e760ddb0be3e",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "54514b1e-7e8f-4cb5-b6ea-729a9ebc9121",
              type: "RELATION",
              name: "assignedTasks",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              label: "Assigned tasks",
              description: "Tasks assigned to the workspace member",
              relationDefinition: {
                relationId: "ec1cc09a-8b22-465d-9d4e-f8e527cfb42b",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  id: "54514b1e-7e8f-4cb5-b6ea-729a9ebc9121",
                  name: "assignedTasks"
                },
                targetObjectMetadata: {
                  id: "24c7b746-68be-40da-8189-8b7ace3d09c8",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                targetFieldMetadata: {
                  id: "998ee4c8-90ab-4bb2-a538-3446e4a8a401",
                  name: "assignee"
                }
              }
            },
            {
              id: "3b0e02e4-4df8-44d0-8049-c1614615c3be",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              label: "Favorites",
              description: "Favorites linked to the workspace member",
              relationDefinition: {
                relationId: "0959e874-8ca0-4b21-9e27-3b22f6c4d4a9",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  id: "3b0e02e4-4df8-44d0-8049-c1614615c3be",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  id: "b09f0836-1179-4530-8339-040f172f57de",
                  name: "workspaceMember"
                }
              }
            },
            {
              id: "b7fa733d-3aa2-4dff-8f6a-7cc37a94bcdb",
              type: "RELATION",
              name: "accountOwnerForCompanies",
              icon: "IconBriefcase",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              label: "Account Owner For Companies",
              description: "Account owner for companies",
              relationDefinition: {
                relationId: "e74da4d0-fa0c-48d8-8948-999095f5205e",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  id: "b7fa733d-3aa2-4dff-8f6a-7cc37a94bcdb",
                  name: "accountOwnerForCompanies"
                },
                targetObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  id: "47fdf1f8-6b52-4502-bf5c-13b3cc2dae33",
                  name: "accountOwner"
                }
              }
            },
            {
              id: "12842f5c-176a-4364-b64e-d64b4ed7f8ad",
              type: "RELATION",
              name: "authoredAttachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              label: "Authored attachments",
              description: "Attachments created by the workspace member",
              relationDefinition: {
                relationId: "975ced5d-8fc4-42e3-9740-1f9a7218dc33",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  id: "12842f5c-176a-4364-b64e-d64b4ed7f8ad",
                  name: "authoredAttachments"
                },
                targetObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  id: "a6ff9bb1-537e-4fa5-ad5f-710304d17f7c",
                  name: "author"
                }
              }
            },
            {
              id: "70206be3-e771-46bf-a231-ffcebee8d0ed",
              type: "RELATION",
              name: "connectedAccounts",
              icon: "IconAt",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              label: "Connected accounts",
              description: "Connected accounts",
              relationDefinition: {
                relationId: "533d36eb-6d9d-4fef-814b-290742d225a4",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  id: "70206be3-e771-46bf-a231-ffcebee8d0ed",
                  name: "connectedAccounts"
                },
                targetObjectMetadata: {
                  id: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
                  nameSingular: "connectedAccount",
                  namePlural: "connectedAccounts"
                },
                targetFieldMetadata: {
                  id: "5b5ee04a-32c1-40d4-8c6c-b438b57e8ec4",
                  name: "accountOwner"
                }
              }
            },
            {
              id: "0ae11dcb-8884-4666-abd1-2eff6e965111",
              type: "RELATION",
              name: "messageParticipants",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              label: "Message Participants",
              description: "Message Participants",
              relationDefinition: {
                relationId: "10d942df-ec48-40bb-9df5-3135187319f5",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  id: "0ae11dcb-8884-4666-abd1-2eff6e965111",
                  name: "messageParticipants"
                },
                targetObjectMetadata: {
                  id: "adc88048-b1a7-493b-b388-bc1edae1abdc",
                  nameSingular: "messageParticipant",
                  namePlural: "messageParticipants"
                },
                targetFieldMetadata: {
                  id: "70e503ed-38c4-4406-af76-226d82cb7b22",
                  name: "workspaceMember"
                }
              }
            },
            {
              id: "d23ff3ad-feab-469a-8e68-64ac636fe62a",
              type: "RELATION",
              name: "blocklist",
              icon: "IconForbid2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              label: "Blocklist",
              description: "Blocklisted handles",
              relationDefinition: {
                relationId: "b9e9ac3a-6aef-4abb-8a87-95a9f7c1a85a",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  id: "d23ff3ad-feab-469a-8e68-64ac636fe62a",
                  name: "blocklist"
                },
                targetObjectMetadata: {
                  id: "db7251bc-9ab2-425f-90f9-0755b34a769a",
                  nameSingular: "blocklist",
                  namePlural: "blocklists"
                },
                targetFieldMetadata: {
                  id: "f4110ff0-24bf-4b3f-82a9-8319f95e30ff",
                  name: "workspaceMember"
                }
              }
            },
            {
              id: "42e60c24-3eea-4edf-b1cf-495597d9e025",
              type: "RELATION",
              name: "calendarEventParticipants",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              label: "Calendar Event Participants",
              description: "Calendar Event Participants",
              relationDefinition: {
                relationId: "0e605026-5673-4cb1-aa6f-ed76ecda3fa5",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  id: "42e60c24-3eea-4edf-b1cf-495597d9e025",
                  name: "calendarEventParticipants"
                },
                targetObjectMetadata: {
                  id: "2470a60f-1133-4a14-8374-5f74eb244afe",
                  nameSingular: "calendarEventParticipant",
                  namePlural: "calendarEventParticipants"
                },
                targetFieldMetadata: {
                  id: "b69dfdf5-a7e4-4fe3-b396-a59db0f0c87a",
                  name: "workspaceMember"
                }
              }
            },
            {
              id: "7bb66a23-8ecf-4f7d-95ee-9650ed76c38d",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              label: "Events",
              description: "Events linked to the workspace member",
              relationDefinition: {
                relationId: "833db5c6-218e-4b7e-9bb9-4a2f9fa0190f",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  id: "7bb66a23-8ecf-4f7d-95ee-9650ed76c38d",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  id: "4357f9a6-ffa4-4cc8-bf3c-b91fa6ce6dc0",
                  name: "workspaceMember"
                }
              }
            },
            {
              id: "bce52828-5582-4420-ae3e-6507bd45e83e",
              type: "RELATION",
              name: "auditLogs",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
              label: "Audit Logs",
              description: "Audit Logs linked to the workspace member",
              relationDefinition: {
                relationId: "b35ac2de-7118-402d-87d1-0c8f131156c6",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                sourceFieldMetadata: {
                  id: "bce52828-5582-4420-ae3e-6507bd45e83e",
                  name: "auditLogs"
                },
                targetObjectMetadata: {
                  id: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
                  nameSingular: "auditLog",
                  namePlural: "auditLogs"
                },
                targetFieldMetadata: {
                  id: "f2c496a8-5477-4383-9546-9ec57826c8f0",
                  name: "workspaceMember"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "d50280da-e1c1-482e-9cf6-833af10c7113",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_e47451872f70c8f187a6b460ac7",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: []
                  }
                }
              }
            ]
          }
        }
      },
      {
        node: {
          id: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "surveyResult",
          namePlural: "surveyResults",
          icon: "IconRulerMeasure",
          isCustom: true,
          isRemote: false,
          isActive: true,
          isSystem: false,
          createdAt: "2025-02-07T10:58:03.962Z",
          updatedAt: "2025-02-07T10:58:03.966Z",
          labelIdentifierFieldMetadataId: "2333e293-d92d-4cd9-8ce5-75922b8ddde2",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Survey result",
          labelPlural: "Survey results",
          description: null,
          fieldsList: [
            {
              id: "9d0e4986-1c80-47c4-999a-2936ea95f8f0",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.974Z",
              updatedAt: "2025-02-07T10:58:03.974Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              label: "Attachments",
              description: "Attachments tied to the Survey result",
              relationDefinition: {
                relationId: "6369b332-29fd-426e-9b54-f66d68a1d516",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                sourceFieldMetadata: {
                  id: "9d0e4986-1c80-47c4-999a-2936ea95f8f0",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  id: "958d0d9d-7199-492b-84a3-7cc2ff5fa35f",
                  name: "surveyResult"
                }
              }
            },
            {
              id: "f31f394e-9fa4-4385-a8d3-1284fe7304b9",
              type: "RELATION",
              name: "noteTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.975Z",
              updatedAt: "2025-02-07T10:58:03.975Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              label: "NoteTargets",
              description: "NoteTargets tied to the Survey result",
              relationDefinition: {
                relationId: "3b9309bf-af5e-4761-9fad-c4e7ccdb9a42",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                sourceFieldMetadata: {
                  id: "f31f394e-9fa4-4385-a8d3-1284fe7304b9",
                  name: "noteTargets"
                },
                targetObjectMetadata: {
                  id: "8f7f73af-32c4-4dcb-ba89-60829345d803",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                targetFieldMetadata: {
                  id: "53b9093e-7489-45d4-af7f-1e6fc89cb44c",
                  name: "surveyResult"
                }
              }
            },
            {
              id: "9283864a-98fc-497c-b319-f73f93ed8c3d",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: null,
              isCustom: false,
              isActive: false,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.986Z",
              updatedAt: "2025-02-07T10:58:03.986Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              id: "d106fe7a-52a5-4f6c-9e3f-d2dba08124b8",
              type: "NUMBER",
              name: "score",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:04.335Z",
              updatedAt: "2025-02-07T10:58:04.335Z",
              defaultValue: null,
              options: null,
              settings: {
                type: "number",
                dataType: "float",
                decimals: 3
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Score (Float 3 decimals)",
              description: ""
            },
            {
              id: "79177fcd-94c6-40d9-836f-95812da06c9f",
              type: "NUMBER",
              name: "percentageOfCompletion",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:04.338Z",
              updatedAt: "2025-02-07T10:58:04.338Z",
              defaultValue: null,
              options: null,
              settings: {
                type: "percentage",
                dataType: "float",
                decimals: 6
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Percentage of completion (Float 3 decimals + percentage)",
              description: ""
            },
            {
              id: "0efa6d60-ea08-450e-a9c9-a3979700ee38",
              type: "NUMBER",
              name: "participants",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:04.340Z",
              updatedAt: "2025-02-07T10:58:04.340Z",
              defaultValue: null,
              options: null,
              settings: {
                type: "number",
                dataType: "int"
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Participants (Int)",
              description: ""
            },
            {
              id: "1af37649-8bba-4704-b9fb-a89bbf2bd907",
              type: "NUMBER",
              name: "averageEstimatedNumberOfAtomsInTheUniverse",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:04.342Z",
              updatedAt: "2025-02-07T10:58:04.342Z",
              defaultValue: null,
              options: null,
              settings: {
                type: "number",
                dataType: "bigint"
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Average estimated number of atoms in the universe (BigInt)",
              description: ""
            },
            {
              id: "8d9e2b6b-7245-471e-a9ab-0f73d765aa59",
              type: "TEXT",
              name: "comments",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:04.345Z",
              updatedAt: "2025-02-07T10:58:04.345Z",
              defaultValue: "''",
              options: null,
              settings: {
                displayedMaxRows: 5
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Comments (Max 5 rows)",
              description: ""
            },
            {
              id: "5193bedc-315a-4cfb-a332-a36cc75adff5",
              type: "TEXT",
              name: "shortNotes",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:04.347Z",
              updatedAt: "2025-02-07T10:58:04.347Z",
              defaultValue: "''",
              options: null,
              settings: {
                displayedMaxRows: 1
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Short notes (Max 1 row)",
              description: ""
            },
            {
              id: "7b9e8e61-2666-4139-8614-ef68274d454d",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.974Z",
              updatedAt: "2025-02-07T10:58:03.974Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              label: "Favorites",
              description: "Favorites tied to the Survey result",
              relationDefinition: {
                relationId: "4982ded1-79f5-4e61-b545-92323b7906bc",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                sourceFieldMetadata: {
                  id: "7b9e8e61-2666-4139-8614-ef68274d454d",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  id: "6d29ca01-b749-4820-b329-58a850493a52",
                  name: "surveyResult"
                }
              }
            },
            {
              id: "a354d48b-31d1-4c11-a4d2-b9d772125223",
              type: "RELATION",
              name: "taskTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.975Z",
              updatedAt: "2025-02-07T10:58:03.975Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              label: "TaskTargets",
              description: "TaskTargets tied to the Survey result",
              relationDefinition: {
                relationId: "1bacfee5-2345-4663-83b5-a32f219fcaca",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                sourceFieldMetadata: {
                  id: "a354d48b-31d1-4c11-a4d2-b9d772125223",
                  name: "taskTargets"
                },
                targetObjectMetadata: {
                  id: "69a22300-9109-4eca-a926-1e26a86f674a",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                targetFieldMetadata: {
                  id: "f7aaeed9-378f-482f-bea1-910c01e932b3",
                  name: "surveyResult"
                }
              }
            },
            {
              id: "71ce6001-688d-40fd-914a-61ca3f21840b",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.962Z",
              updatedAt: "2025-02-07T10:58:03.962Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "2333e293-d92d-4cd9-8ce5-75922b8ddde2",
              type: "TEXT",
              name: "name",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.962Z",
              updatedAt: "2025-02-07T10:58:03.962Z",
              defaultValue: "'Untitled'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Name",
              description: "Name"
            },
            {
              id: "26115225-bf48-4859-80a2-5e3dd848800e",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.962Z",
              updatedAt: "2025-02-07T10:58:03.962Z",
              defaultValue: "now",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "a3322061-0ff3-4f3a-b2f1-d92c46cdc667",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.962Z",
              updatedAt: "2025-02-07T10:58:03.962Z",
              defaultValue: "now",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "b3eaac78-0948-4296-a2d1-06dbc371fc99",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.962Z",
              updatedAt: "2025-02-07T10:58:03.962Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Deleted at",
              description: "Deletion date"
            },
            {
              id: "4f2d78e8-c81f-4b3a-8947-40254b2f7ef2",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.962Z",
              updatedAt: "2025-02-07T10:58:03.962Z",
              defaultValue: {
                name: "''",
                source: "'MANUAL'"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              id: "a9cf001b-3093-4b87-86d1-67cdc0223ff4",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.962Z",
              updatedAt: "2025-02-07T10:58:03.962Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              relationDefinition: null,
              label: "Position",
              description: "Position"
            },
            {
              id: "ddef1b52-93c7-40d3-b44e-68452fd1ce10",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.975Z",
              updatedAt: "2025-02-07T10:58:03.975Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
              label: "TimelineActivities",
              description: "TimelineActivities tied to the Survey result",
              relationDefinition: {
                relationId: "fc52b0b9-97f8-446b-8e5f-8a3041cc1760",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                sourceFieldMetadata: {
                  id: "ddef1b52-93c7-40d3-b44e-68452fd1ce10",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  id: "ba8f152e-aeb0-4c8b-96ac-e64938078027",
                  name: "surveyResult"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "baf24f25-ae52-48cc-acaa-382ee7bc6c9a",
                  createdAt: "2025-02-07T10:58:03.991Z",
                  updatedAt: "2025-02-07T10:58:03.991Z",
                  name: "IDX_e2a25535adda4544be555d3b6d8",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "e272ced4-8505-4517-b53b-ffdfdd1e4701",
                          createdAt: "2025-02-07T10:58:03.991Z",
                          updatedAt: "2025-02-07T10:58:03.991Z",
                          order: 0,
                          fieldMetadataId: "9283864a-98fc-497c-b319-f73f93ed8c3d"
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
        node: {
          id: "c722cbde-6aaf-4128-aa90-bb142b40408e",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "workflowRun",
          namePlural: "workflowRuns",
          icon: "IconSettingsAutomation",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "b83b5bcb-0eac-4329-92aa-67638aeba11c",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Workflow Run",
          labelPlural: "Workflow Runs",
          description: "A workflow run",
          fieldsList: [
            {
              id: "b83b5bcb-0eac-4329-92aa-67638aeba11c",
              type: "TEXT",
              name: "name",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              relationDefinition: null,
              label: "Name",
              description: "Name of the workflow run"
            },
            {
              id: "d95680d3-37fa-4fa0-b61c-1204cf6d4415",
              type: "DATE_TIME",
              name: "startedAt",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              relationDefinition: null,
              label: "Workflow run started at",
              description: "Workflow run started at"
            },
            {
              id: "76052788-1fdd-46c6-8b0e-cd453ee79412",
              type: "DATE_TIME",
              name: "endedAt",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              relationDefinition: null,
              label: "Workflow run ended at",
              description: "Workflow run ended at"
            },
            {
              id: "a83b5405-ab9d-4c11-ae05-9991efe2881d",
              type: "SELECT",
              name: "status",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'NOT_STARTED'",
              options: [
                {
                  id: "f4b815e2-aabb-4780-aa85-121d8b103d6e",
                  color: "gray",
                  label: "Not started",
                  value: "NOT_STARTED",
                  position: 0
                },
                {
                  id: "906acbe2-12ea-428e-853d-52f2f262c9e4",
                  color: "yellow",
                  label: "Running",
                  value: "RUNNING",
                  position: 1
                },
                {
                  id: "f00b6ef1-971b-4d8f-a701-0d704111cc81",
                  color: "green",
                  label: "Completed",
                  value: "COMPLETED",
                  position: 2
                },
                {
                  id: "d3947960-5bd2-490a-b564-6fea090c02cd",
                  color: "red",
                  label: "Failed",
                  value: "FAILED",
                  position: 3
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              relationDefinition: null,
              label: "Workflow run status",
              description: "Workflow run status"
            },
            {
              id: "7e36a925-6a3f-40c3-a269-1a871d382b3f",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              relationDefinition: null,
              label: "Executed by",
              description: "The executor of the workflow"
            },
            {
              id: "cab3c1d9-1d77-43e1-96ee-f554cf8183e3",
              type: "RAW_JSON",
              name: "output",
              icon: "IconText",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              relationDefinition: null,
              label: "Output",
              description: "Json object to provide output of the workflow run"
            },
            {
              id: "30b804a0-6568-4481-a40a-60e2a9612816",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              relationDefinition: null,
              label: "Position",
              description: "Workflow run position"
            },
            {
              id: "c2db929b-aac4-4e61-a212-7e965380fac5",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "14dfe607-8692-4385-af40-1defdad1b596",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "b79fc1be-cb87-4610-8935-724e40376a9f",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "1e7a02f1-69fd-4254-9c13-7d94ca24db7d",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "bf47704b-fd5e-45a5-855b-d53da55d8286",
              type: "UUID",
              name: "workflowVersionId",
              icon: "IconVersions",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              relationDefinition: null,
              label: "Workflow version id (foreign key)",
              description: "Workflow version linked to the run. id foreign key"
            },
            {
              id: "7d57ec4d-2846-45a1-bf68-38e2c6195e02",
              type: "RELATION",
              name: "workflowVersion",
              icon: "IconVersions",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              label: "Workflow version",
              description: "Workflow version linked to the run.",
              relationDefinition: {
                relationId: "96b8ebff-bbde-4cee-8279-a59d2ae90f8b",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c722cbde-6aaf-4128-aa90-bb142b40408e",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                sourceFieldMetadata: {
                  id: "7d57ec4d-2846-45a1-bf68-38e2c6195e02",
                  name: "workflowVersion"
                },
                targetObjectMetadata: {
                  id: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                targetFieldMetadata: {
                  id: "ae014a11-cb65-4a89-8592-cd7f3cf16025",
                  name: "runs"
                }
              }
            },
            {
              id: "f2d990d6-8d5a-45e5-a2f0-3e46c0ce0607",
              type: "UUID",
              name: "workflowId",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "Workflow linked to the run. id foreign key"
            },
            {
              id: "e69f8a7e-90fc-42e0-a007-a97c615c62d0",
              type: "RELATION",
              name: "workflow",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              label: "Workflow",
              description: "Workflow linked to the run.",
              relationDefinition: {
                relationId: "39d7527e-0669-4cbd-b0f5-342929f08d15",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c722cbde-6aaf-4128-aa90-bb142b40408e",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                sourceFieldMetadata: {
                  id: "e69f8a7e-90fc-42e0-a007-a97c615c62d0",
                  name: "workflow"
                },
                targetObjectMetadata: {
                  id: "086e4ff9-7a55-4974-9756-710f2f46425c",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                targetFieldMetadata: {
                  id: "93ae910b-8ae8-4ee3-853a-c2ede901942e",
                  name: "runs"
                }
              }
            },
            {
              id: "c4d8fde0-6e4c-44ea-bed9-b5376bdb196e",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              label: "Favorites",
              description: "Favorites linked to the workflow run",
              relationDefinition: {
                relationId: "75d35a12-4862-4b1f-8233-a3e5dbf93ada",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "c722cbde-6aaf-4128-aa90-bb142b40408e",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                sourceFieldMetadata: {
                  id: "c4d8fde0-6e4c-44ea-bed9-b5376bdb196e",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  id: "a7b807b3-1e7b-4f4d-a6b7-32545c2411ad",
                  name: "workflowRun"
                }
              }
            },
            {
              id: "c6b6bc99-6dd9-4c06-a79f-9b2870fcfc63",
              type: "RELATION",
              name: "timelineActivities",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c722cbde-6aaf-4128-aa90-bb142b40408e",
              label: "Timeline Activities",
              description: "Timeline activities linked to the run",
              relationDefinition: {
                relationId: "633a96de-a16b-4da9-a1ac-a794c8f1406f",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "c722cbde-6aaf-4128-aa90-bb142b40408e",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                sourceFieldMetadata: {
                  id: "c6b6bc99-6dd9-4c06-a79f-9b2870fcfc63",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  id: "6704a8e8-4ed9-48e7-a899-ebcdb55979c2",
                  name: "workflowRun"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "16940538-df20-4ae3-bee5-7c6cef48b969",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_faa5772594c4ce15b9305919f2f",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "4eaf93b9-b9e7-4ad2-b107-ec12588381a2",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "bf47704b-fd5e-45a5-855b-d53da55d8286"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "e103ee52-f99f-4540-b54f-f3fc65d400b3",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_eee970874f46ff99eefc0015001",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "30076d11-c533-444d-9623-0417c6214058",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "1e7a02f1-69fd-4254-9c13-7d94ca24db7d"
                        }
                      },
                      {
                        node: {
                          id: "7eef6c5e-b2cb-498b-9990-7f6dee94e879",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "f2d990d6-8d5a-45e5-a2f0-3e46c0ce0607"
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
        node: {
          id: "c21d8721-1976-42f6-91a1-c5d4819b128b",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "messageChannel",
          namePlural: "messageChannels",
          icon: "IconMessage",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "84663c16-2cb8-4e51-9818-4745ca788e3d",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Message Channel",
          labelPlural: "Message Channels",
          description: "Message Channels",
          fieldsList: [
            {
              id: "eda06e21-fcc8-47a5-95ff-8e97f16fca46",
              type: "SELECT",
              name: "visibility",
              icon: "IconEyeglass",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'SHARE_EVERYTHING'",
              options: [
                {
                  id: "7e245b99-b77d-455c-ba9f-3a6a1582888f",
                  color: "green",
                  label: "Metadata",
                  value: "METADATA",
                  position: 0
                },
                {
                  id: "816abf18-57e2-454c-a1e4-bbe5ee59f8e1",
                  color: "blue",
                  label: "Subject",
                  value: "SUBJECT",
                  position: 1
                },
                {
                  id: "1f7f4940-3023-4d7d-ab5e-7fdc3bc38bd1",
                  color: "orange",
                  label: "Share Everything",
                  value: "SHARE_EVERYTHING",
                  position: 2
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Visibility",
              description: "Visibility"
            },
            {
              id: "84663c16-2cb8-4e51-9818-4745ca788e3d",
              type: "TEXT",
              name: "handle",
              icon: "IconAt",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Handle",
              description: "Handle"
            },
            {
              id: "b801d241-333f-4282-9cec-f651fdae7d82",
              type: "SELECT",
              name: "type",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'email'",
              options: [
                {
                  id: "b8978c83-7114-4950-811b-18e51094b029",
                  color: "green",
                  label: "Email",
                  value: "email",
                  position: 0
                },
                {
                  id: "28d4835c-647f-4795-961a-e1fa155aeeeb",
                  color: "blue",
                  label: "SMS",
                  value: "sms",
                  position: 1
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Type",
              description: "Channel Type"
            },
            {
              id: "c7bc1158-9ad8-4005-ae68-c2256a8072bd",
              type: "BOOLEAN",
              name: "isContactAutoCreationEnabled",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Is Contact Auto Creation Enabled",
              description: "Is Contact Auto Creation Enabled"
            },
            {
              id: "d6b096a6-a671-4f2c-802e-f6d26a76060f",
              type: "SELECT",
              name: "contactAutoCreationPolicy",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'SENT'",
              options: [
                {
                  id: "607c7e08-7561-4bff-b10d-316d44832a4d",
                  color: "green",
                  label: "Sent and Received",
                  value: "SENT_AND_RECEIVED",
                  position: 0
                },
                {
                  id: "5477eb0d-5257-483f-bca3-ce480e437bac",
                  color: "blue",
                  label: "Sent",
                  value: "SENT",
                  position: 1
                },
                {
                  id: "a6edcf84-bde5-4a61-ad8d-243415998eec",
                  color: "red",
                  label: "None",
                  value: "NONE",
                  position: 2
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Contact auto creation policy",
              description: "Automatically create People records when receiving or sending emails"
            },
            {
              id: "4cd1617f-914c-4ba9-9014-b8ab86191ab2",
              type: "BOOLEAN",
              name: "excludeNonProfessionalEmails",
              icon: "IconBriefcase",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Exclude non professional emails",
              description: "Exclude non professional emails"
            },
            {
              id: "8d66c844-c5fd-43d9-9bf6-8085005e12bc",
              type: "BOOLEAN",
              name: "excludeGroupEmails",
              icon: "IconUsersGroup",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Exclude group emails",
              description: "Exclude group emails"
            },
            {
              id: "3f8b517e-aca0-448c-8351-1b7bff2a906d",
              type: "BOOLEAN",
              name: "isSyncEnabled",
              icon: "IconRefresh",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Is Sync Enabled",
              description: "Is Sync Enabled"
            },
            {
              id: "2c9347b7-7940-424f-8b01-9b3db70027ae",
              type: "TEXT",
              name: "syncCursor",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Last sync cursor",
              description: "Last sync cursor"
            },
            {
              id: "08770ce4-2219-48e3-a95f-d3f1154f3238",
              type: "DATE_TIME",
              name: "syncedAt",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Last sync date",
              description: "Last sync date"
            },
            {
              id: "803aa84a-6a81-4fe1-b1f9-e6fb1a7278b1",
              type: "SELECT",
              name: "syncStatus",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: [
                {
                  id: "cbf0ab70-2d7a-457a-acf1-7331b04c331e",
                  color: "yellow",
                  label: "Ongoing",
                  value: "ONGOING",
                  position: 1
                },
                {
                  id: "1d884a7b-3f86-4ee1-a044-e8b6c51c722a",
                  color: "blue",
                  label: "Not Synced",
                  value: "NOT_SYNCED",
                  position: 2
                },
                {
                  id: "362dbada-fa73-44ee-b721-e49ce0e4d55e",
                  color: "green",
                  label: "Active",
                  value: "ACTIVE",
                  position: 3
                },
                {
                  id: "1b343c97-2059-43e0-a912-7dab8e22e80c",
                  color: "red",
                  label: "Failed Insufficient Permissions",
                  value: "FAILED_INSUFFICIENT_PERMISSIONS",
                  position: 4
                },
                {
                  id: "aba54411-c623-4f00-91a1-038244c2b995",
                  color: "red",
                  label: "Failed Unknown",
                  value: "FAILED_UNKNOWN",
                  position: 5
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Sync status",
              description: "Sync status"
            },
            {
              id: "4e66b09b-f933-4c54-91cc-c1f8d2885055",
              type: "SELECT",
              name: "syncStage",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'FULL_MESSAGE_LIST_FETCH_PENDING'",
              options: [
                {
                  id: "bd087845-a9da-4243-b9cb-ba31e0d27e6f",
                  color: "blue",
                  label: "Full messages list fetch pending",
                  value: "FULL_MESSAGE_LIST_FETCH_PENDING",
                  position: 0
                },
                {
                  id: "28116590-6b39-43bb-b844-6b9ad889b655",
                  color: "blue",
                  label: "Partial messages list fetch pending",
                  value: "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
                  position: 1
                },
                {
                  id: "90dca9be-e156-48f2-a48d-7dbbf1282063",
                  color: "orange",
                  label: "Messages list fetch ongoing",
                  value: "MESSAGE_LIST_FETCH_ONGOING",
                  position: 2
                },
                {
                  id: "e69c234d-4dec-4cb8-a179-f77fbf1ac9ed",
                  color: "blue",
                  label: "Messages import pending",
                  value: "MESSAGES_IMPORT_PENDING",
                  position: 3
                },
                {
                  id: "6b5c581a-cc73-4158-9ebc-9b3a8131f4a6",
                  color: "orange",
                  label: "Messages import ongoing",
                  value: "MESSAGES_IMPORT_ONGOING",
                  position: 4
                },
                {
                  id: "03a59572-06a8-45f1-b2e1-dc5ba6713af7",
                  color: "red",
                  label: "Failed",
                  value: "FAILED",
                  position: 5
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Sync stage",
              description: "Sync stage"
            },
            {
              id: "13cb8da3-75d2-4726-9c91-588c380001a1",
              type: "DATE_TIME",
              name: "syncStageStartedAt",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Sync stage started at",
              description: "Sync stage started at"
            },
            {
              id: "21ad9f64-c438-42ed-b73d-d3d0c8772b4d",
              type: "NUMBER",
              name: "throttleFailureCount",
              icon: "IconX",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Throttle Failure Count",
              description: "Throttle Failure Count"
            },
            {
              id: "18060a04-b40b-4fae-8d94-b8de13f059e4",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "3b19c265-9287-495e-9809-00e07af89e74",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "9187f28d-308a-4ac8-a3f9-6e5a68f18e24",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "81a932a0-be49-4f42-a2c4-54fc380d7c87",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "f90b6bce-5dcf-47b4-9505-5ededd2e60c9",
              type: "UUID",
              name: "connectedAccountId",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              relationDefinition: null,
              label: "Connected Account id (foreign key)",
              description: "Connected Account id foreign key"
            },
            {
              id: "d34cd44d-9398-4964-a31d-6bf02a568f23",
              type: "RELATION",
              name: "connectedAccount",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              label: "Connected Account",
              description: "Connected Account",
              relationDefinition: {
                relationId: "1097c05e-8d91-472b-bd8f-b2649aa514b6",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c21d8721-1976-42f6-91a1-c5d4819b128b",
                  nameSingular: "messageChannel",
                  namePlural: "messageChannels"
                },
                sourceFieldMetadata: {
                  id: "d34cd44d-9398-4964-a31d-6bf02a568f23",
                  name: "connectedAccount"
                },
                targetObjectMetadata: {
                  id: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
                  nameSingular: "connectedAccount",
                  namePlural: "connectedAccounts"
                },
                targetFieldMetadata: {
                  id: "54bedea7-cf0b-4b51-9421-784f78e2f9e4",
                  name: "messageChannels"
                }
              }
            },
            {
              id: "4328d22a-3482-4a8c-810f-782e10fbc9e4",
              type: "RELATION",
              name: "messageChannelMessageAssociations",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              label: "Message Channel Association",
              description: "Messages from the channel.",
              relationDefinition: {
                relationId: "0bff6c45-8eb0-40e7-b49f-6ecf27609e5c",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "c21d8721-1976-42f6-91a1-c5d4819b128b",
                  nameSingular: "messageChannel",
                  namePlural: "messageChannels"
                },
                sourceFieldMetadata: {
                  id: "4328d22a-3482-4a8c-810f-782e10fbc9e4",
                  name: "messageChannelMessageAssociations"
                },
                targetObjectMetadata: {
                  id: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
                  nameSingular: "messageChannelMessageAssociation",
                  namePlural: "messageChannelMessageAssociations"
                },
                targetFieldMetadata: {
                  id: "c0e8c2f4-a05d-4269-a7df-51069e0f0ae5",
                  name: "messageChannel"
                }
              }
            },
            {
              id: "3b520a79-1141-4521-9927-7cd491f2a3d9",
              type: "RELATION",
              name: "messageFolders",
              icon: "IconFolder",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c21d8721-1976-42f6-91a1-c5d4819b128b",
              label: "Message Folders",
              description: "Message Folders",
              relationDefinition: {
                relationId: "e470cdd1-4011-4cb7-aab3-c5a7524f157b",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "c21d8721-1976-42f6-91a1-c5d4819b128b",
                  nameSingular: "messageChannel",
                  namePlural: "messageChannels"
                },
                sourceFieldMetadata: {
                  id: "3b520a79-1141-4521-9927-7cd491f2a3d9",
                  name: "messageFolders"
                },
                targetObjectMetadata: {
                  id: "7d618ca1-1604-4082-94b7-0c105874aa8b",
                  nameSingular: "messageFolder",
                  namePlural: "messageFolders"
                },
                targetFieldMetadata: {
                  id: "4ebfd6d3-d223-4702-9f1a-ec95ba1a7dd9",
                  name: "messageChannel"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "bcbf43a1-7b8c-42f8-a694-b609556be104",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_c3af632ce35236d21f8ae1f4cfd",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "5a31358f-54ab-44f2-ac2c-521b90385b14",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "f90b6bce-5dcf-47b4-9505-5ededd2e60c9"
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
        node: {
          id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "favorite",
          namePlural: "favorites",
          icon: "IconHeart",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "97a214cc-de5c-4b11-931e-27cfaa4de175",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Favorite",
          labelPlural: "Favorites",
          description: "A favorite that can be accessed from the left menu",
          fieldsList: [
            {
              id: "7c93afc1-bfbc-4df1-9d74-b8cb97ddac38",
              type: "NUMBER",
              name: "position",
              icon: "IconList",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Position",
              description: "Favorite position"
            },
            {
              id: "97a214cc-de5c-4b11-931e-27cfaa4de175",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "dd2a5cb9-cfe5-45f1-bc4a-d996605c6a34",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "97659153-63d8-4cf6-971e-fecfed044709",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "4186c5e6-822a-4f64-9c36-0df51e93096b",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "78012d71-3e1e-4f69-adb9-6abdbf50e30f",
              type: "UUID",
              name: "workspaceMemberId",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Workspace Member id (foreign key)",
              description: "Favorite workspace member id foreign key"
            },
            {
              id: "b09f0836-1179-4530-8339-040f172f57de",
              type: "RELATION",
              name: "workspaceMember",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              label: "Workspace Member",
              description: "Favorite workspace member",
              relationDefinition: {
                relationId: "0959e874-8ca0-4b21-9e27-3b22f6c4d4a9",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  id: "b09f0836-1179-4530-8339-040f172f57de",
                  name: "workspaceMember"
                },
                targetObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  id: "3b0e02e4-4df8-44d0-8049-c1614615c3be",
                  name: "favorites"
                }
              }
            },
            {
              id: "cce646ee-c39e-4132-85ba-cc173c8fd29f",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "Favorite person id foreign key"
            },
            {
              id: "a68bd1d1-41ca-401d-a7d4-7595a7ab92a0",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              label: "Person",
              description: "Favorite person",
              relationDefinition: {
                relationId: "3cd19494-e9cf-4525-a44d-33d3c4fd8592",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  id: "a68bd1d1-41ca-401d-a7d4-7595a7ab92a0",
                  name: "person"
                },
                targetObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  id: "9ea7d6f6-9116-4694-bae7-43dc58785a11",
                  name: "favorites"
                }
              }
            },
            {
              id: "bf3a4de5-5fdf-4c12-ba4f-f9bb3b53ce0c",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "Favorite company id foreign key"
            },
            {
              id: "30e6bee7-8f94-4287-b3d4-966fda3caf59",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              label: "Company",
              description: "Favorite company",
              relationDefinition: {
                relationId: "57830de4-fc66-4917-a7b0-1671a3e591d6",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  id: "30e6bee7-8f94-4287-b3d4-966fda3caf59",
                  name: "company"
                },
                targetObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  id: "2b4da937-7a61-4bd6-83fa-ac025fbc8ff8",
                  name: "favorites"
                }
              }
            },
            {
              id: "62981b27-6aa6-4a80-b636-fb4211d13171",
              type: "UUID",
              name: "favoriteFolderId",
              icon: "IconFolder",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Favorite Folder id (foreign key)",
              description: "The folder this favorite belongs to id foreign key"
            },
            {
              id: "ebd05eaf-8e7f-4c7b-8bd7-c5cd65f859a3",
              type: "RELATION",
              name: "favoriteFolder",
              icon: "IconFolder",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              label: "Favorite Folder",
              description: "The folder this favorite belongs to",
              relationDefinition: {
                relationId: "589a7e00-4b0c-40fe-8731-3f06b8c8fd60",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  id: "ebd05eaf-8e7f-4c7b-8bd7-c5cd65f859a3",
                  name: "favoriteFolder"
                },
                targetObjectMetadata: {
                  id: "b875135a-2144-44e5-bad5-360e1bf4762b",
                  nameSingular: "favoriteFolder",
                  namePlural: "favoriteFolders"
                },
                targetFieldMetadata: {
                  id: "4e9934c1-9092-47a2-b1a6-94558d93c01b",
                  name: "favorites"
                }
              }
            },
            {
              id: "d416f4dc-f43e-4e9a-aa80-d9ed19734090",
              type: "UUID",
              name: "opportunityId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Opportunity id (foreign key)",
              description: "Favorite opportunity id foreign key"
            },
            {
              id: "6c33db09-4333-4487-973a-c7bad7b692a9",
              type: "RELATION",
              name: "opportunity",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              label: "Opportunity",
              description: "Favorite opportunity",
              relationDefinition: {
                relationId: "72c989d7-7560-4eac-a235-46fdde9a989a",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  id: "6c33db09-4333-4487-973a-c7bad7b692a9",
                  name: "opportunity"
                },
                targetObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  id: "b3db8b78-69f1-4f19-8630-780e27345246",
                  name: "favorites"
                }
              }
            },
            {
              id: "fd2206d9-63bf-47fa-b95d-79def25760bd",
              type: "UUID",
              name: "workflowId",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "Favorite workflow id foreign key"
            },
            {
              id: "ef99269a-a63d-41f2-9aa7-a462f552f931",
              type: "RELATION",
              name: "workflow",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              label: "Workflow",
              description: "Favorite workflow",
              relationDefinition: {
                relationId: "def517f1-7564-4d48-979b-04128ddc40cb",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  id: "ef99269a-a63d-41f2-9aa7-a462f552f931",
                  name: "workflow"
                },
                targetObjectMetadata: {
                  id: "086e4ff9-7a55-4974-9756-710f2f46425c",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                targetFieldMetadata: {
                  id: "c63b223f-3adf-44c2-96c0-4a70b08f0b29",
                  name: "favorites"
                }
              }
            },
            {
              id: "68aa029f-c498-4918-88c6-4c8156a4b2f5",
              type: "UUID",
              name: "workflowVersionId",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "Favorite workflow version id foreign key"
            },
            {
              id: "546ae29e-d855-4a6a-97fb-7596a24a15a3",
              type: "RELATION",
              name: "workflowVersion",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              label: "Workflow",
              description: "Favorite workflow version",
              relationDefinition: {
                relationId: "289cbe78-1bd5-481d-aa51-a2d55034f50a",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  id: "546ae29e-d855-4a6a-97fb-7596a24a15a3",
                  name: "workflowVersion"
                },
                targetObjectMetadata: {
                  id: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                targetFieldMetadata: {
                  id: "7209df76-c596-468f-8155-b7a443703d21",
                  name: "favorites"
                }
              }
            },
            {
              id: "e4e8fce0-31c1-4d40-ad26-ea1c12b7a7d7",
              type: "UUID",
              name: "workflowRunId",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "Favorite workflow run id foreign key"
            },
            {
              id: "a7b807b3-1e7b-4f4d-a6b7-32545c2411ad",
              type: "RELATION",
              name: "workflowRun",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              label: "Workflow",
              description: "Favorite workflow run",
              relationDefinition: {
                relationId: "75d35a12-4862-4b1f-8233-a3e5dbf93ada",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  id: "a7b807b3-1e7b-4f4d-a6b7-32545c2411ad",
                  name: "workflowRun"
                },
                targetObjectMetadata: {
                  id: "c722cbde-6aaf-4128-aa90-bb142b40408e",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                targetFieldMetadata: {
                  id: "c4d8fde0-6e4c-44ea-bed9-b5376bdb196e",
                  name: "favorites"
                }
              }
            },
            {
              id: "8ecb9f96-c312-45f8-8052-4dc9c53d1cc6",
              type: "UUID",
              name: "taskId",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Task id (foreign key)",
              description: "Favorite task id foreign key"
            },
            {
              id: "4a7a62ee-1202-41f0-8466-78729ed6d199",
              type: "RELATION",
              name: "task",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              label: "Task",
              description: "Favorite task",
              relationDefinition: {
                relationId: "658ac5b6-c1a8-49b3-a6f9-71c237650a58",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  id: "4a7a62ee-1202-41f0-8466-78729ed6d199",
                  name: "task"
                },
                targetObjectMetadata: {
                  id: "24c7b746-68be-40da-8189-8b7ace3d09c8",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                targetFieldMetadata: {
                  id: "d9ae12c1-f284-4e72-b27a-9f199b28253b",
                  name: "favorites"
                }
              }
            },
            {
              id: "af93234d-10d3-4011-8a24-ddb28c15db2b",
              type: "UUID",
              name: "noteId",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Note id (foreign key)",
              description: "Favorite note id foreign key"
            },
            {
              id: "260743f3-8b46-4259-997a-b26c65409be4",
              type: "RELATION",
              name: "note",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              label: "Note",
              description: "Favorite note",
              relationDefinition: {
                relationId: "dcdb01b8-5b34-48f5-92e7-bac40a882d78",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  id: "260743f3-8b46-4259-997a-b26c65409be4",
                  name: "note"
                },
                targetObjectMetadata: {
                  id: "11404ff2-0997-45dc-8efd-6ba08c12e150",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                targetFieldMetadata: {
                  id: "84e4cd96-9eed-47ce-884c-1244e55f3c5a",
                  name: "favorites"
                }
              }
            },
            {
              id: "af61d3f5-d348-4174-8da3-2b0e2d91a5c0",
              type: "UUID",
              name: "viewId",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "View id (foreign key)",
              description: "Favorite view id foreign key"
            },
            {
              id: "caecaa25-2377-497a-a731-1a304ed983d8",
              type: "RELATION",
              name: "view",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              label: "View",
              description: "Favorite view",
              relationDefinition: {
                relationId: "c3f8e4eb-ff00-4d92-bf44-fac0dc1a0919",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  id: "caecaa25-2377-497a-a731-1a304ed983d8",
                  name: "view"
                },
                targetObjectMetadata: {
                  id: "bf29268e-6c8e-48db-98a8-994f2931011e",
                  nameSingular: "view",
                  namePlural: "views"
                },
                targetFieldMetadata: {
                  id: "b98d9d74-d712-4fae-aad7-93d0f78aa59c",
                  name: "favorites"
                }
              }
            },
            {
              id: "1c5f2b2f-456a-4fd4-b749-fb873e9064a4",
              type: "RELATION",
              name: "pet",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.269Z",
              updatedAt: "2025-02-07T10:58:03.269Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              label: "Pet",
              description: "Favorites Pet",
              relationDefinition: {
                relationId: "b03a7e39-6823-47b6-9e7b-81452c3156d2",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  id: "1c5f2b2f-456a-4fd4-b749-fb873e9064a4",
                  name: "pet"
                },
                targetObjectMetadata: {
                  id: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                targetFieldMetadata: {
                  id: "509b030f-75c2-4b2f-93e2-bd66ac24d2a5",
                  name: "favorites"
                }
              }
            },
            {
              id: "6f6c8f08-7fb8-455d-9e57-15aadac79bd2",
              type: "UUID",
              name: "petId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.269Z",
              updatedAt: "2025-02-07T10:58:03.269Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Pet ID (foreign key)",
              description: "Favorite Pet id foreign key"
            },
            {
              id: "6d29ca01-b749-4820-b329-58a850493a52",
              type: "RELATION",
              name: "surveyResult",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.974Z",
              updatedAt: "2025-02-07T10:58:03.974Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              label: "Survey result",
              description: "Favorites Survey result",
              relationDefinition: {
                relationId: "4982ded1-79f5-4e61-b545-92323b7906bc",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                sourceFieldMetadata: {
                  id: "6d29ca01-b749-4820-b329-58a850493a52",
                  name: "surveyResult"
                },
                targetObjectMetadata: {
                  id: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                targetFieldMetadata: {
                  id: "7b9e8e61-2666-4139-8614-ef68274d454d",
                  name: "favorites"
                }
              }
            },
            {
              id: "be44b9a6-4413-43b3-8306-3a5b4b6f4920",
              type: "UUID",
              name: "surveyResultId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.974Z",
              updatedAt: "2025-02-07T10:58:03.974Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
              relationDefinition: null,
              label: "Survey result ID (foreign key)",
              description: "Favorite Survey result id foreign key"
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "1a84fca4-6ccb-43aa-a39c-66c02e3c9ff6",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_7c59b29a053016fc596ddad8a0e",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "b7e4e277-fe72-4705-9bad-872e794794b8",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "4186c5e6-822a-4f64-9c36-0df51e93096b"
                        }
                      },
                      {
                        node: {
                          id: "93ba63e7-3004-4aae-ab3a-dff46e076e06",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "e4e8fce0-31c1-4d40-ad26-ea1c12b7a7d7"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "9c45e384-d2e2-4008-8206-44ce78eaa900",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_85f024f9ec673d530d14cf75fe5",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: []
                  }
                }
              },
              {
                node: {
                  id: "d5c325ec-a340-4e45-9700-724b650eab86",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_a900d9f809273abe54dc5e166fa",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "6cdbcd5f-bf9b-4d1b-b92c-6da52295c4ea",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "bf3a4de5-5fdf-4c12-ba4f-f9bb3b53ce0c"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "55d4bdaf-2c72-412b-be0a-a88689ee6159",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_110d1dc7f0ecd231a18f6784cf3",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "3dd0011b-afd9-4d7a-90ee-8078dd5dc30e",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "4186c5e6-822a-4f64-9c36-0df51e93096b"
                        }
                      },
                      {
                        node: {
                          id: "b6e6f3f1-e53c-4548-a898-d2272986c6c2",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "68aa029f-c498-4918-88c6-4c8156a4b2f5"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "0e8a4642-c20a-49c7-a748-dd637da38eb5",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_21d905e0adf19e835f6059a9f3d",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "cd0fb969-6c09-499c-8a87-13d8d2a6d5c3",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "4186c5e6-822a-4f64-9c36-0df51e93096b"
                        }
                      },
                      {
                        node: {
                          id: "1466a251-9291-4490-9851-644c9fe7a866",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "af93234d-10d3-4011-8a24-ddb28c15db2b"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "d1973850-8be0-466b-8bdf-f80c1cba79f6",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_e14b3424016bea8b7fe220f7761",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "c05d5f66-b4a5-413e-aaa1-ee3dadab08e0",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "8ecb9f96-c312-45f8-8052-4dc9c53d1cc6"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "99f123d5-1425-4938-a021-2bda580ea937",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_c3ee83d51bc99ba99fe1998c508",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "a91306c4-ae41-4efa-ac67-0236e09c3176",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "4186c5e6-822a-4f64-9c36-0df51e93096b"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "bd55f09c-7316-41bd-a49f-836c45c83daa",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_eecddc968e93b9b8ebbfd85dad3",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "650a0747-c527-4cd1-8de6-b82fa6af783b",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "4186c5e6-822a-4f64-9c36-0df51e93096b"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "35906830-c810-41bc-912a-8725d7c132f7",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_505a1fccd2804f2472bd92e8720",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "9e381379-6868-411b-9e98-d21dfc1fa882",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "4186c5e6-822a-4f64-9c36-0df51e93096b"
                        }
                      },
                      {
                        node: {
                          id: "b817a61b-17f1-447e-8142-162c20f8b754",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "af61d3f5-d348-4174-8da3-2b0e2d91a5c0"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "e51d5351-0986-47df-b3c1-adc47a72c048",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_b810a8e37adf5cafd342170ccf8",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "c271dd48-f64b-4777-a7d5-a326f35a5de7",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "4186c5e6-822a-4f64-9c36-0df51e93096b"
                        }
                      },
                      {
                        node: {
                          id: "ea5d9b1a-c48e-408e-add4-f72614374347",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "62981b27-6aa6-4a80-b636-fb4211d13171"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "eda60655-49eb-4dd2-9bd1-6fe768a151d9",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_1f7e4cb168e77496349c8cefed6",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "e070865e-4b99-4b25-a377-99e6b4d8285b",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "cce646ee-c39e-4132-85ba-cc173c8fd29f"
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
        node: {
          id: "bf29268e-6c8e-48db-98a8-994f2931011e",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "view",
          namePlural: "views",
          icon: "IconLayoutCollage",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "34c9ba63-eeab-41b2-8fa8-1060eff89cc6",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "View",
          labelPlural: "Views",
          description: "(System) Views",
          fieldsList: [
            {
              id: "58d03374-392e-472a-9de5-e68c13e250b3",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "d7f1c4ef-839b-4732-9996-a317f22c5916",
              type: "RELATION",
              name: "viewFields",
              icon: "IconTag",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              label: "View Fields",
              description: "View Fields",
              relationDefinition: {
                relationId: "146721ce-7491-4450-87d3-1456c6aaadde",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "bf29268e-6c8e-48db-98a8-994f2931011e",
                  nameSingular: "view",
                  namePlural: "views"
                },
                sourceFieldMetadata: {
                  id: "d7f1c4ef-839b-4732-9996-a317f22c5916",
                  name: "viewFields"
                },
                targetObjectMetadata: {
                  id: "a9488860-f866-43cc-a47a-cb732613b59b",
                  nameSingular: "viewField",
                  namePlural: "viewFields"
                },
                targetFieldMetadata: {
                  id: "7c339dc1-747c-493f-8f35-b30197bdb53b",
                  name: "view"
                }
              }
            },
            {
              id: "25ecb061-ac5e-4d74-932c-b21822c5192c",
              type: "RELATION",
              name: "viewGroups",
              icon: "IconTag",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              label: "View Groups",
              description: "View Groups",
              relationDefinition: {
                relationId: "c90d85c9-3476-42a2-96d4-0eda35cd36d8",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "bf29268e-6c8e-48db-98a8-994f2931011e",
                  nameSingular: "view",
                  namePlural: "views"
                },
                sourceFieldMetadata: {
                  id: "25ecb061-ac5e-4d74-932c-b21822c5192c",
                  name: "viewGroups"
                },
                targetObjectMetadata: {
                  id: "adf5d61e-5403-4cd9-ad50-e95828f357ee",
                  nameSingular: "viewGroup",
                  namePlural: "viewGroups"
                },
                targetFieldMetadata: {
                  id: "6bc7a428-124b-49f1-bf29-31830d48dfac",
                  name: "view"
                }
              }
            },
            {
              id: "34c9ba63-eeab-41b2-8fa8-1060eff89cc6",
              type: "TEXT",
              name: "name",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "Name",
              description: "View name"
            },
            {
              id: "ad89b43f-b81e-42d7-a662-9126f27fbcb2",
              type: "UUID",
              name: "objectMetadataId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "Object Metadata Id",
              description: "View target object"
            },
            {
              id: "28d9b35c-3a9c-4efa-b884-412edf526175",
              type: "TEXT",
              name: "type",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'table'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "Type",
              description: "View type"
            },
            {
              id: "b13cb64e-ad4d-40a2-94ac-a6e0a9a05be5",
              type: "SELECT",
              name: "key",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'INDEX'",
              options: [
                {
                  id: "06c19665-9988-40bb-a6a9-80d897c5c78c",
                  color: "red",
                  label: "Index",
                  value: "INDEX",
                  position: 0
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "Key",
              description: "View key"
            },
            {
              id: "21ab5568-c47b-48cf-8245-5bd52b8a995b",
              type: "TEXT",
              name: "icon",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "Icon",
              description: "View icon"
            },
            {
              id: "b79d8ac6-c239-4154-b334-04bad2807dae",
              type: "TEXT",
              name: "kanbanFieldMetadataId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "kanbanfieldMetadataId",
              description: "View Kanban column field"
            },
            {
              id: "95128b2e-5976-48e6-a863-d7f754e247d6",
              type: "POSITION",
              name: "position",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "Position",
              description: "View position"
            },
            {
              id: "a7616583-d4be-40c1-8202-e1174c89ba50",
              type: "BOOLEAN",
              name: "isCompact",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: false,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "Compact View",
              description: "Describes if the view is in compact mode"
            },
            {
              id: "4895f340-2171-4ec9-a09b-f8e1c980186a",
              type: "SELECT",
              name: "kanbanAggregateOperation",
              icon: "IconCalculator",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'COUNT'",
              options: [
                {
                  id: "bf55e81e-2c66-42ba-9aa4-e46fcf24e59d",
                  color: "red",
                  label: "Average",
                  value: "AVG",
                  position: 0
                },
                {
                  id: "0e40a463-6159-41aa-89d9-b0322615c8c0",
                  color: "purple",
                  label: "Count",
                  value: "COUNT",
                  position: 1
                },
                {
                  id: "d21d80a6-f378-4629-910f-fc872a3faaa1",
                  color: "sky",
                  label: "Maximum",
                  value: "MAX",
                  position: 2
                },
                {
                  id: "013c58d1-eb91-4d3e-a57a-bf8b0369039d",
                  color: "turquoise",
                  label: "Minimum",
                  value: "MIN",
                  position: 3
                },
                {
                  id: "f246b694-7df7-4342-995d-4b6b0730a023",
                  color: "yellow",
                  label: "Sum",
                  value: "SUM",
                  position: 4
                },
                {
                  id: "d099c8e9-54fe-4da2-9642-39fd3c85b621",
                  color: "red",
                  label: "Count empty",
                  value: "COUNT_EMPTY",
                  position: 5
                },
                {
                  id: "42ec97b2-9585-4483-a317-b8657f15395d",
                  color: "purple",
                  label: "Count not empty",
                  value: "COUNT_NOT_EMPTY",
                  position: 6
                },
                {
                  id: "2a514fdf-9ab2-4481-aed5-08e856a279d6",
                  color: "sky",
                  label: "Count unique values",
                  value: "COUNT_UNIQUE_VALUES",
                  position: 7
                },
                {
                  id: "0b11a3d0-69c4-4723-9445-26f7f0d0b573",
                  color: "turquoise",
                  label: "Percent empty",
                  value: "PERCENTAGE_EMPTY",
                  position: 8
                },
                {
                  id: "5064b906-c3da-4be6-a231-555eea8af631",
                  color: "yellow",
                  label: "Percent not empty",
                  value: "PERCENTAGE_NOT_EMPTY",
                  position: 9
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "Aggregate operation",
              description: "Optional aggregate operation"
            },
            {
              id: "b679cbe5-4374-4084-8a8e-9cb37fdc8710",
              type: "UUID",
              name: "kanbanAggregateOperationFieldMetadataId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "Field metadata used for aggregate operation",
              description: "Field metadata used for aggregate operation"
            },
            {
              id: "59e1eb65-a1a6-4fec-99e9-c7febc058676",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "412781ca-83da-42c8-9f14-a25c6266d85c",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "84b88c6a-daf3-4eb1-8532-d5c33b67ca8c",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "07f7d681-4b18-40de-ba6a-08296acf4ec4",
              type: "RELATION",
              name: "viewFilters",
              icon: "IconFilterBolt",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              label: "View Filters",
              description: "View Filters",
              relationDefinition: {
                relationId: "e48b6f4c-4f27-4703-8fbe-b5ac2428e8e7",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "bf29268e-6c8e-48db-98a8-994f2931011e",
                  nameSingular: "view",
                  namePlural: "views"
                },
                sourceFieldMetadata: {
                  id: "07f7d681-4b18-40de-ba6a-08296acf4ec4",
                  name: "viewFilters"
                },
                targetObjectMetadata: {
                  id: "f205d335-c203-4aff-b911-fe03266f5151",
                  nameSingular: "viewFilter",
                  namePlural: "viewFilters"
                },
                targetFieldMetadata: {
                  id: "8b94d72d-00b0-4ef6-8d6f-2653d8fa369b",
                  name: "view"
                }
              }
            },
            {
              id: "71ecd6d8-d240-4056-ac51-9514812fec43",
              type: "RELATION",
              name: "viewFilterGroups",
              icon: "IconFilterBolt",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              label: "View Filter Groups",
              description: "View Filter Groups",
              relationDefinition: {
                relationId: "57f2a9a9-a07f-411a-bff3-5db696e068f5",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "bf29268e-6c8e-48db-98a8-994f2931011e",
                  nameSingular: "view",
                  namePlural: "views"
                },
                sourceFieldMetadata: {
                  id: "71ecd6d8-d240-4056-ac51-9514812fec43",
                  name: "viewFilterGroups"
                },
                targetObjectMetadata: {
                  id: "efd63ec8-5b7a-4198-8db1-6e822d4ca406",
                  nameSingular: "viewFilterGroup",
                  namePlural: "viewFilterGroups"
                },
                targetFieldMetadata: {
                  id: "08eccaf2-6956-48f1-98fb-e042cefc654b",
                  name: "view"
                }
              }
            },
            {
              id: "716da602-d548-453a-acb6-a0cc69201bc5",
              type: "RELATION",
              name: "viewSorts",
              icon: "IconArrowsSort",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              label: "View Sorts",
              description: "View Sorts",
              relationDefinition: {
                relationId: "eaa01b4b-dcfd-4527-97a2-14e6f7dc5fc9",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "bf29268e-6c8e-48db-98a8-994f2931011e",
                  nameSingular: "view",
                  namePlural: "views"
                },
                sourceFieldMetadata: {
                  id: "716da602-d548-453a-acb6-a0cc69201bc5",
                  name: "viewSorts"
                },
                targetObjectMetadata: {
                  id: "a833bfc4-9fe2-4c79-b36c-c0fdca8cb67c",
                  nameSingular: "viewSort",
                  namePlural: "viewSorts"
                },
                targetFieldMetadata: {
                  id: "a10d5cdc-c093-4f35-b6df-7bdda8ac4083",
                  name: "view"
                }
              }
            },
            {
              id: "b98d9d74-d712-4fae-aad7-93d0f78aa59c",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "bf29268e-6c8e-48db-98a8-994f2931011e",
              label: "Favorites",
              description: "Favorites linked to the view",
              relationDefinition: {
                relationId: "c3f8e4eb-ff00-4d92-bf44-fac0dc1a0919",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "bf29268e-6c8e-48db-98a8-994f2931011e",
                  nameSingular: "view",
                  namePlural: "views"
                },
                sourceFieldMetadata: {
                  id: "b98d9d74-d712-4fae-aad7-93d0f78aa59c",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  id: "caecaa25-2377-497a-a731-1a304ed983d8",
                  name: "view"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: []
          }
        }
      },
      {
        node: {
          id: "b875135a-2144-44e5-bad5-360e1bf4762b",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "favoriteFolder",
          namePlural: "favoriteFolders",
          icon: "IconFolder",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "62cb8bb4-13d1-4d74-a285-065f82e288e1",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Favorite Folder",
          labelPlural: "Favorite Folders",
          description: "A Folder of favorites",
          fieldsList: [
            {
              id: "c809741f-5aee-467d-a3dc-185e032a3ac8",
              type: "NUMBER",
              name: "position",
              icon: "IconList",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b875135a-2144-44e5-bad5-360e1bf4762b",
              relationDefinition: null,
              label: "Position",
              description: "Favorite folder position"
            },
            {
              id: "0a318dad-a218-4ec4-add9-d33c5f630452",
              type: "TEXT",
              name: "name",
              icon: "IconText",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b875135a-2144-44e5-bad5-360e1bf4762b",
              relationDefinition: null,
              label: "Name",
              description: "Name of the favorite folder"
            },
            {
              id: "62cb8bb4-13d1-4d74-a285-065f82e288e1",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b875135a-2144-44e5-bad5-360e1bf4762b",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "7b5ab7ce-4b8e-44f5-8328-380dab6c63c4",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "b875135a-2144-44e5-bad5-360e1bf4762b",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "518072c4-e98b-4723-b8ab-a515ef902d6b",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "b875135a-2144-44e5-bad5-360e1bf4762b",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "01047b06-1658-4bb4-aa3c-cf561aada444",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "b875135a-2144-44e5-bad5-360e1bf4762b",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "4e9934c1-9092-47a2-b1a6-94558d93c01b",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b875135a-2144-44e5-bad5-360e1bf4762b",
              label: "Favorites",
              description: "Favorites in this folder",
              relationDefinition: {
                relationId: "589a7e00-4b0c-40fe-8731-3f06b8c8fd60",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "b875135a-2144-44e5-bad5-360e1bf4762b",
                  nameSingular: "favoriteFolder",
                  namePlural: "favoriteFolders"
                },
                sourceFieldMetadata: {
                  id: "4e9934c1-9092-47a2-b1a6-94558d93c01b",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  id: "ebd05eaf-8e7f-4c7b-8bd7-c5cd65f859a3",
                  name: "favoriteFolder"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: []
          }
        }
      },
      {
        node: {
          id: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "workflowVersion",
          namePlural: "workflowVersions",
          icon: "IconSettingsAutomation",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "e53e3868-f735-4e05-80ab-5bbafe578abc",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Workflow Version",
          labelPlural: "Workflow Versions",
          description: "A workflow version",
          fieldsList: [
            {
              id: "e53e3868-f735-4e05-80ab-5bbafe578abc",
              type: "TEXT",
              name: "name",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              relationDefinition: null,
              label: "Name",
              description: "The workflow version name"
            },
            {
              id: "2a0326a3-36e3-4a37-8cc2-fc3f85107bf3",
              type: "RAW_JSON",
              name: "trigger",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              relationDefinition: null,
              label: "Version trigger",
              description: "Json object to provide trigger"
            },
            {
              id: "bf60084f-b051-497f-beb1-9172eeb30ac0",
              type: "RAW_JSON",
              name: "steps",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              relationDefinition: null,
              label: "Version steps",
              description: "Json object to provide steps"
            },
            {
              id: "f4af747a-f0a0-46c9-93b1-a7afd692d3c4",
              type: "SELECT",
              name: "status",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'DRAFT'",
              options: [
                {
                  id: "e5419d8f-72b2-414e-9a02-7bf2dcea9998",
                  color: "yellow",
                  label: "Draft",
                  value: "DRAFT",
                  position: 0
                },
                {
                  id: "a37920a8-184a-485f-8d4c-f30113baa3ce",
                  color: "green",
                  label: "Active",
                  value: "ACTIVE",
                  position: 1
                },
                {
                  id: "cffd3b21-408b-4121-9547-d9bd490e196f",
                  color: "orange",
                  label: "Deactivated",
                  value: "DEACTIVATED",
                  position: 2
                },
                {
                  id: "ee1b1f58-cdf3-4023-aa92-3fff23f7c0d9",
                  color: "gray",
                  label: "Archived",
                  value: "ARCHIVED",
                  position: 3
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              relationDefinition: null,
              label: "Version status",
              description: "The workflow version status"
            },
            {
              id: "5ebcb60b-2c60-4319-9846-5cd9bc179ebf",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              relationDefinition: null,
              label: "Position",
              description: "Workflow version position"
            },
            {
              id: "b29c89f3-daf8-429c-942a-e2a9f5acd4d0",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "0031f675-6948-4455-8b45-0d0060e0e066",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "ed8287c0-7ec3-4680-82ce-5b9ea6061c44",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "fc1156b1-a11a-4fae-889c-53b4957501a6",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "8bd803d8-82f6-4906-a93c-56d13c007a81",
              type: "UUID",
              name: "workflowId",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "WorkflowVersion workflow id foreign key"
            },
            {
              id: "8faadf15-6e7d-4b58-b06c-4c3ed34eb78f",
              type: "RELATION",
              name: "workflow",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              label: "Workflow",
              description: "WorkflowVersion workflow",
              relationDefinition: {
                relationId: "3ef2e5a3-c76b-446e-b486-19c53fcaaa37",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                sourceFieldMetadata: {
                  id: "8faadf15-6e7d-4b58-b06c-4c3ed34eb78f",
                  name: "workflow"
                },
                targetObjectMetadata: {
                  id: "086e4ff9-7a55-4974-9756-710f2f46425c",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                targetFieldMetadata: {
                  id: "727e02c9-5ffd-4d97-b4de-82c4eff3f535",
                  name: "versions"
                }
              }
            },
            {
              id: "ae014a11-cb65-4a89-8592-cd7f3cf16025",
              type: "RELATION",
              name: "runs",
              icon: "IconRun",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              label: "Runs",
              description: "Workflow runs linked to the version.",
              relationDefinition: {
                relationId: "96b8ebff-bbde-4cee-8279-a59d2ae90f8b",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                sourceFieldMetadata: {
                  id: "ae014a11-cb65-4a89-8592-cd7f3cf16025",
                  name: "runs"
                },
                targetObjectMetadata: {
                  id: "c722cbde-6aaf-4128-aa90-bb142b40408e",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                targetFieldMetadata: {
                  id: "7d57ec4d-2846-45a1-bf68-38e2c6195e02",
                  name: "workflowVersion"
                }
              }
            },
            {
              id: "7209df76-c596-468f-8155-b7a443703d21",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              label: "Favorites",
              description: "Favorites linked to the workflow version",
              relationDefinition: {
                relationId: "289cbe78-1bd5-481d-aa51-a2d55034f50a",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                sourceFieldMetadata: {
                  id: "7209df76-c596-468f-8155-b7a443703d21",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  id: "546ae29e-d855-4a6a-97fb-7596a24a15a3",
                  name: "workflowVersion"
                }
              }
            },
            {
              id: "cb1b748f-dd70-4303-8100-e73efd57538f",
              type: "RELATION",
              name: "timelineActivities",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
              label: "Timeline Activities",
              description: "Timeline activities linked to the version",
              relationDefinition: {
                relationId: "b12e4f3b-8a0f-4099-9c9a-2bb4d1e8941c",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                sourceFieldMetadata: {
                  id: "cb1b748f-dd70-4303-8100-e73efd57538f",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  id: "3c11dd63-921b-46cc-93c1-7bbbf1f89285",
                  name: "workflowVersion"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "b3c62308-5c3b-4766-9450-f80efbd16b99",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_a362c5eff4a28fcdffdd3bdff16",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "9f774ebc-e038-476b-ad51-1a9959feafa8",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "8bd803d8-82f6-4906-a93c-56d13c007a81"
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
        node: {
          id: "adf5d61e-5403-4cd9-ad50-e95828f357ee",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "viewGroup",
          namePlural: "viewGroups",
          icon: "IconTag",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "13e28987-c4c8-4e02-a163-9364f2f138a0",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "View Group",
          labelPlural: "View Groups",
          description: "(System) View Groups",
          fieldsList: [
            {
              id: "d98b0075-1b6f-4c34-8a92-88259fc46e2a",
              type: "UUID",
              name: "fieldMetadataId",
              icon: "IconTag",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adf5d61e-5403-4cd9-ad50-e95828f357ee",
              relationDefinition: null,
              label: "Field Metadata Id",
              description: "View Group target field"
            },
            {
              id: "06ece04e-c23d-45c2-9506-72f8c2df7cb2",
              type: "BOOLEAN",
              name: "isVisible",
              icon: "IconEye",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adf5d61e-5403-4cd9-ad50-e95828f357ee",
              relationDefinition: null,
              label: "Visible",
              description: "View Group visibility"
            },
            {
              id: "dfe77bae-5d5b-43e5-9d10-17b861f459bc",
              type: "TEXT",
              name: "fieldValue",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adf5d61e-5403-4cd9-ad50-e95828f357ee",
              relationDefinition: null,
              label: "Field Value",
              description: "Group by this field value"
            },
            {
              id: "5b2d0530-7062-4823-a195-becb2c211f2e",
              type: "NUMBER",
              name: "position",
              icon: "IconList",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adf5d61e-5403-4cd9-ad50-e95828f357ee",
              relationDefinition: null,
              label: "Position",
              description: "View Field position"
            },
            {
              id: "13e28987-c4c8-4e02-a163-9364f2f138a0",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adf5d61e-5403-4cd9-ad50-e95828f357ee",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "ea448c69-192b-48e8-b317-d1b3814b589d",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "adf5d61e-5403-4cd9-ad50-e95828f357ee",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "18478bf3-82c9-477d-8a84-01acffe02a50",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "adf5d61e-5403-4cd9-ad50-e95828f357ee",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "f98f1fe3-fb87-48ec-a3f9-7b26f1a47605",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "adf5d61e-5403-4cd9-ad50-e95828f357ee",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "6351bcd5-fe08-4da7-8189-a1b8b236c508",
              type: "UUID",
              name: "viewId",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adf5d61e-5403-4cd9-ad50-e95828f357ee",
              relationDefinition: null,
              label: "View id (foreign key)",
              description: "View Group related view id foreign key"
            },
            {
              id: "6bc7a428-124b-49f1-bf29-31830d48dfac",
              type: "RELATION",
              name: "view",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adf5d61e-5403-4cd9-ad50-e95828f357ee",
              label: "View",
              description: "View Group related view",
              relationDefinition: {
                relationId: "c90d85c9-3476-42a2-96d4-0eda35cd36d8",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "adf5d61e-5403-4cd9-ad50-e95828f357ee",
                  nameSingular: "viewGroup",
                  namePlural: "viewGroups"
                },
                sourceFieldMetadata: {
                  id: "6bc7a428-124b-49f1-bf29-31830d48dfac",
                  name: "view"
                },
                targetObjectMetadata: {
                  id: "bf29268e-6c8e-48db-98a8-994f2931011e",
                  nameSingular: "view",
                  namePlural: "views"
                },
                targetFieldMetadata: {
                  id: "25ecb061-ac5e-4d74-932c-b21822c5192c",
                  name: "viewGroups"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "291a206d-8a0b-4434-b2ba-1ced4bd88f53",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_3819ec73f42c743a0d3700ae8e4",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "0858d0c0-8631-41ba-822b-a4fb40ca9313",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "f98f1fe3-fb87-48ec-a3f9-7b26f1a47605"
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
        node: {
          id: "adc88048-b1a7-493b-b388-bc1edae1abdc",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "messageParticipant",
          namePlural: "messageParticipants",
          icon: "IconUserCircle",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "23823a52-9b87-4df0-ace3-814bd674fe56",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Message Participant",
          labelPlural: "Message Participants",
          description: "Message Participants",
          fieldsList: [
            {
              id: "b170ab7a-e707-443d-a5fc-ad9cf082f685",
              type: "SELECT",
              name: "role",
              icon: "IconAt",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'from'",
              options: [
                {
                  id: "4fdfba12-e0e2-48ff-a97f-9b568581655e",
                  color: "green",
                  label: "From",
                  value: "from",
                  position: 0
                },
                {
                  id: "18c6b9fa-bb64-45f8-89af-14e4500de3c3",
                  color: "blue",
                  label: "To",
                  value: "to",
                  position: 1
                },
                {
                  id: "f343f556-fc55-4ff1-a589-a2d73f55c479",
                  color: "orange",
                  label: "Cc",
                  value: "cc",
                  position: 2
                },
                {
                  id: "04798c92-0881-4d49-855e-f8d265d5bfe5",
                  color: "red",
                  label: "Bcc",
                  value: "bcc",
                  position: 3
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adc88048-b1a7-493b-b388-bc1edae1abdc",
              relationDefinition: null,
              label: "Role",
              description: "Role"
            },
            {
              id: "23823a52-9b87-4df0-ace3-814bd674fe56",
              type: "TEXT",
              name: "handle",
              icon: "IconAt",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adc88048-b1a7-493b-b388-bc1edae1abdc",
              relationDefinition: null,
              label: "Handle",
              description: "Handle"
            },
            {
              id: "7c8b66b1-f519-44e5-a1ff-a8c44eef4e75",
              type: "TEXT",
              name: "displayName",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adc88048-b1a7-493b-b388-bc1edae1abdc",
              relationDefinition: null,
              label: "Display Name",
              description: "Display Name"
            },
            {
              id: "f500dafc-a987-467e-a453-93cfdbd6ce40",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adc88048-b1a7-493b-b388-bc1edae1abdc",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "551cc838-6d6a-4c58-8fa4-a863e9b4a66e",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "adc88048-b1a7-493b-b388-bc1edae1abdc",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "7a8330b5-e9aa-4318-b9ce-208e42230999",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "adc88048-b1a7-493b-b388-bc1edae1abdc",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "7a93a030-6554-4256-91a0-f720d3e6921b",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "adc88048-b1a7-493b-b388-bc1edae1abdc",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "27707fe0-5f71-48ba-b593-b4cc498b0314",
              type: "UUID",
              name: "messageId",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adc88048-b1a7-493b-b388-bc1edae1abdc",
              relationDefinition: null,
              label: "Message id (foreign key)",
              description: "Message id foreign key"
            },
            {
              id: "93063aec-efc9-4187-bffb-c126ab4def1e",
              type: "RELATION",
              name: "message",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adc88048-b1a7-493b-b388-bc1edae1abdc",
              label: "Message",
              description: "Message",
              relationDefinition: {
                relationId: "24489acb-39fd-45f4-8ccd-19b5e77c97b1",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "adc88048-b1a7-493b-b388-bc1edae1abdc",
                  nameSingular: "messageParticipant",
                  namePlural: "messageParticipants"
                },
                sourceFieldMetadata: {
                  id: "93063aec-efc9-4187-bffb-c126ab4def1e",
                  name: "message"
                },
                targetObjectMetadata: {
                  id: "15e17021-5b35-434f-b246-edcb51d583a6",
                  nameSingular: "message",
                  namePlural: "messages"
                },
                targetFieldMetadata: {
                  id: "6dbe41d2-ba69-47a5-a4e0-297264a61ac7",
                  name: "messageParticipants"
                }
              }
            },
            {
              id: "97f5d755-868f-4d92-9b62-8915a570c4d5",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adc88048-b1a7-493b-b388-bc1edae1abdc",
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "Person id foreign key"
            },
            {
              id: "b42e6657-7c2a-4c95-afa1-95182a341f8f",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adc88048-b1a7-493b-b388-bc1edae1abdc",
              label: "Person",
              description: "Person",
              relationDefinition: {
                relationId: "9962d554-e63c-498f-8ea2-29a5debbed58",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "adc88048-b1a7-493b-b388-bc1edae1abdc",
                  nameSingular: "messageParticipant",
                  namePlural: "messageParticipants"
                },
                sourceFieldMetadata: {
                  id: "b42e6657-7c2a-4c95-afa1-95182a341f8f",
                  name: "person"
                },
                targetObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  id: "3a5177b3-431e-4667-9db7-c8d0539ae684",
                  name: "messageParticipants"
                }
              }
            },
            {
              id: "00bd58bf-cc97-49c6-b59b-4303e42677ae",
              type: "UUID",
              name: "workspaceMemberId",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adc88048-b1a7-493b-b388-bc1edae1abdc",
              relationDefinition: null,
              label: "Workspace Member id (foreign key)",
              description: "Workspace member id foreign key"
            },
            {
              id: "70e503ed-38c4-4406-af76-226d82cb7b22",
              type: "RELATION",
              name: "workspaceMember",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "adc88048-b1a7-493b-b388-bc1edae1abdc",
              label: "Workspace Member",
              description: "Workspace member",
              relationDefinition: {
                relationId: "10d942df-ec48-40bb-9df5-3135187319f5",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "adc88048-b1a7-493b-b388-bc1edae1abdc",
                  nameSingular: "messageParticipant",
                  namePlural: "messageParticipants"
                },
                sourceFieldMetadata: {
                  id: "70e503ed-38c4-4406-af76-226d82cb7b22",
                  name: "workspaceMember"
                },
                targetObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  id: "0ae11dcb-8884-4666-abd1-2eff6e965111",
                  name: "messageParticipants"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "e9b2ab1a-f114-4e91-8da9-1812217d4c2c",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_8d0144e4074d86d0cb7094f40c2",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "5195a694-7d18-44b8-9e26-5a0a8ea0508f",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "27707fe0-5f71-48ba-b593-b4cc498b0314"
                        }
                      },
                      {
                        node: {
                          id: "f9e6b2c5-effc-421f-a6b6-3d6a9140bdc1",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "7a93a030-6554-4256-91a0-f720d3e6921b"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "e4adb531-b333-4108-9b4c-870958a38aaf",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_6d9700e5ae2ab8c294d614e72f6",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "76e04576-48c0-40eb-9d68-7e4612e8d444",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "7a93a030-6554-4256-91a0-f720d3e6921b"
                        }
                      },
                      {
                        node: {
                          id: "a4366bdb-28a4-4147-9f29-89145d498c1b",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "97f5d755-868f-4d92-9b62-8915a570c4d5"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "6c353339-89c7-404d-8d60-00f51bbad6d3",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_8c4f617db0813d41aef587e49ea",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "0c434cd1-373a-4b5a-8601-cb61fd36a16f",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "7a93a030-6554-4256-91a0-f720d3e6921b"
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
        node: {
          id: "a9488860-f866-43cc-a47a-cb732613b59b",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "viewField",
          namePlural: "viewFields",
          icon: "IconTag",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "3f928ced-2795-4bd8-b62d-389c3307eb22",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "View Field",
          labelPlural: "View Fields",
          description: "(System) View Fields",
          fieldsList: [
            {
              id: "6faedbf7-6770-470e-bb65-270ea0f54855",
              type: "UUID",
              name: "fieldMetadataId",
              icon: "IconTag",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a9488860-f866-43cc-a47a-cb732613b59b",
              relationDefinition: null,
              label: "Field Metadata Id",
              description: "View Field target field"
            },
            {
              id: "290a5465-e735-47c9-8f64-74e42c86e29c",
              type: "BOOLEAN",
              name: "isVisible",
              icon: "IconEye",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a9488860-f866-43cc-a47a-cb732613b59b",
              relationDefinition: null,
              label: "Visible",
              description: "View Field visibility"
            },
            {
              id: "cf1b845d-787f-49f4-86a6-de35d80b611f",
              type: "NUMBER",
              name: "size",
              icon: "IconEye",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a9488860-f866-43cc-a47a-cb732613b59b",
              relationDefinition: null,
              label: "Size",
              description: "View Field size"
            },
            {
              id: "ecf8db64-74b4-4b52-894d-88aa5b2e2d65",
              type: "NUMBER",
              name: "position",
              icon: "IconList",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a9488860-f866-43cc-a47a-cb732613b59b",
              relationDefinition: null,
              label: "Position",
              description: "View Field position"
            },
            {
              id: "5ff1b730-6980-4955-a170-c970d157e4e8",
              type: "SELECT",
              name: "aggregateOperation",
              icon: "IconCalculator",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: [
                {
                  id: "c4437ab1-297f-41dc-a5d9-40197b4a94bd",
                  color: "red",
                  label: "Average",
                  value: "AVG",
                  position: 0
                },
                {
                  id: "94a32ba3-6c14-4e94-9374-d974c7e21709",
                  color: "purple",
                  label: "Count",
                  value: "COUNT",
                  position: 1
                },
                {
                  id: "a9ba9239-79c9-425f-89ec-2c68ce4395a4",
                  color: "sky",
                  label: "Maximum",
                  value: "MAX",
                  position: 2
                },
                {
                  id: "538028e8-6859-4d93-9455-fdfd4dbf87cb",
                  color: "turquoise",
                  label: "Minimum",
                  value: "MIN",
                  position: 3
                },
                {
                  id: "09e4beef-a79e-4fb5-80d1-ac086ecd5923",
                  color: "yellow",
                  label: "Sum",
                  value: "SUM",
                  position: 4
                },
                {
                  id: "0390a503-6347-4a96-97f6-7f2cb9c0268d",
                  color: "red",
                  label: "Count empty",
                  value: "COUNT_EMPTY",
                  position: 5
                },
                {
                  id: "44811a6b-50b0-41ec-83ae-987fba53bf36",
                  color: "purple",
                  label: "Count not empty",
                  value: "COUNT_NOT_EMPTY",
                  position: 6
                },
                {
                  id: "a1ec0543-11ad-429e-8321-e62a4e1ffa8b",
                  color: "sky",
                  label: "Count unique values",
                  value: "COUNT_UNIQUE_VALUES",
                  position: 7
                },
                {
                  id: "84bb12bc-3ab5-4666-b750-45a0b4624a54",
                  color: "turquoise",
                  label: "Percent empty",
                  value: "PERCENTAGE_EMPTY",
                  position: 8
                },
                {
                  id: "be097323-c468-4c67-8cae-959ac2c7eb3c",
                  color: "yellow",
                  label: "Percent not empty",
                  value: "PERCENTAGE_NOT_EMPTY",
                  position: 9
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a9488860-f866-43cc-a47a-cb732613b59b",
              relationDefinition: null,
              label: "Aggregate operation",
              description: "Optional aggregate operation"
            },
            {
              id: "3f928ced-2795-4bd8-b62d-389c3307eb22",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a9488860-f866-43cc-a47a-cb732613b59b",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "f08e2681-86f3-490a-a11e-53f147330eb6",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a9488860-f866-43cc-a47a-cb732613b59b",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "9cedf02f-9ad6-473f-b909-403ed5a166bf",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a9488860-f866-43cc-a47a-cb732613b59b",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "fa1f75df-069f-478a-984d-0606a622f72a",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a9488860-f866-43cc-a47a-cb732613b59b",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "78011d95-29be-45f2-9b7c-5d1d6679c83e",
              type: "UUID",
              name: "viewId",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a9488860-f866-43cc-a47a-cb732613b59b",
              relationDefinition: null,
              label: "View id (foreign key)",
              description: "View Field related view id foreign key"
            },
            {
              id: "7c339dc1-747c-493f-8f35-b30197bdb53b",
              type: "RELATION",
              name: "view",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a9488860-f866-43cc-a47a-cb732613b59b",
              label: "View",
              description: "View Field related view",
              relationDefinition: {
                relationId: "146721ce-7491-4450-87d3-1456c6aaadde",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "a9488860-f866-43cc-a47a-cb732613b59b",
                  nameSingular: "viewField",
                  namePlural: "viewFields"
                },
                sourceFieldMetadata: {
                  id: "7c339dc1-747c-493f-8f35-b30197bdb53b",
                  name: "view"
                },
                targetObjectMetadata: {
                  id: "bf29268e-6c8e-48db-98a8-994f2931011e",
                  nameSingular: "view",
                  namePlural: "views"
                },
                targetFieldMetadata: {
                  id: "d7f1c4ef-839b-4732-9996-a317f22c5916",
                  name: "viewFields"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "276b20ed-9787-41d4-862f-d14cf4235cd9",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_UNIQUE_6d269465206d2f3e283ce479b2e",
                  indexWhereClause: "\"deletedAt\" IS NULL",
                  indexType: "BTREE",
                  isUnique: true,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "54532985-a1a5-45ae-b887-df16f17c1082",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "78011d95-29be-45f2-9b7c-5d1d6679c83e"
                        }
                      },
                      {
                        node: {
                          id: "3b65b181-67a7-4928-89c0-0bbf4ec12685",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "6faedbf7-6770-470e-bb65-270ea0f54855"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "8acd3e4e-85a0-436e-b0be-3615206a05de",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_260f80ae1d2ccc67388995d6d05",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "9274019f-a206-4b5a-915c-40fdbc33f802",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "fa1f75df-069f-478a-984d-0606a622f72a"
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
        node: {
          id: "a833bfc4-9fe2-4c79-b36c-c0fdca8cb67c",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "viewSort",
          namePlural: "viewSorts",
          icon: "IconArrowsSort",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "40a79fe2-1570-416b-83f5-03e42df2e8bb",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "View Sort",
          labelPlural: "View Sorts",
          description: "(System) View Sorts",
          fieldsList: [
            {
              id: "347983ed-8b64-4a9d-98bc-ab5273129cff",
              type: "UUID",
              name: "fieldMetadataId",
              icon: "IconTag",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a833bfc4-9fe2-4c79-b36c-c0fdca8cb67c",
              relationDefinition: null,
              label: "Field Metadata Id",
              description: "View Sort target field"
            },
            {
              id: "dd43423d-e89b-4b4e-a73a-326fde7f894a",
              type: "TEXT",
              name: "direction",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'asc'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a833bfc4-9fe2-4c79-b36c-c0fdca8cb67c",
              relationDefinition: null,
              label: "Direction",
              description: "View Sort direction"
            },
            {
              id: "40a79fe2-1570-416b-83f5-03e42df2e8bb",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a833bfc4-9fe2-4c79-b36c-c0fdca8cb67c",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "dda9b417-2d3a-46c4-bfcd-3d1cac7fb357",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a833bfc4-9fe2-4c79-b36c-c0fdca8cb67c",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "6b70711b-2ada-4937-b8bf-2062a1cdf72f",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a833bfc4-9fe2-4c79-b36c-c0fdca8cb67c",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "e3e5aae7-65ed-439c-a0b2-a8f66763c681",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a833bfc4-9fe2-4c79-b36c-c0fdca8cb67c",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "73d360ac-7748-4d47-be23-db6d668c8242",
              type: "UUID",
              name: "viewId",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a833bfc4-9fe2-4c79-b36c-c0fdca8cb67c",
              relationDefinition: null,
              label: "View id (foreign key)",
              description: "View Sort related view id foreign key"
            },
            {
              id: "a10d5cdc-c093-4f35-b6df-7bdda8ac4083",
              type: "RELATION",
              name: "view",
              icon: "IconLayoutCollage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a833bfc4-9fe2-4c79-b36c-c0fdca8cb67c",
              label: "View",
              description: "View Sort related view",
              relationDefinition: {
                relationId: "eaa01b4b-dcfd-4527-97a2-14e6f7dc5fc9",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "a833bfc4-9fe2-4c79-b36c-c0fdca8cb67c",
                  nameSingular: "viewSort",
                  namePlural: "viewSorts"
                },
                sourceFieldMetadata: {
                  id: "a10d5cdc-c093-4f35-b6df-7bdda8ac4083",
                  name: "view"
                },
                targetObjectMetadata: {
                  id: "bf29268e-6c8e-48db-98a8-994f2931011e",
                  nameSingular: "view",
                  namePlural: "views"
                },
                targetFieldMetadata: {
                  id: "716da602-d548-453a-acb6-a0cc69201bc5",
                  name: "viewSorts"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "cd988afc-3670-4961-b51f-a7831842d6a3",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_a01889a3e5b30d56447736329aa",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "e5e69b16-4af3-4f3b-96cf-e04917a4c119",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "73d360ac-7748-4d47-be23-db6d668c8242"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "300adfef-c670-4706-8ed4-9779d17cbca1",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_UNIQUE_9564690e029f3f186dff29c9c88",
                  indexWhereClause: "\"deletedAt\" IS NULL",
                  indexType: "BTREE",
                  isUnique: true,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "946bf9f1-c993-4149-814b-1565358a74c9",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "347983ed-8b64-4a9d-98bc-ab5273129cff"
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
        node: {
          id: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "connectedAccount",
          namePlural: "connectedAccounts",
          icon: "IconAt",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "d87f8cdd-34b8-40e7-bfd5-e0bdeadaeb61",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Connected Account",
          labelPlural: "Connected Accounts",
          description: "A connected account",
          fieldsList: [
            {
              id: "846a6d40-19e0-4856-9735-a8e8f61d0504",
              type: "ARRAY",
              name: "scopes",
              icon: "IconSettings",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              relationDefinition: null,
              label: "Scopes",
              description: "Scopes"
            },
            {
              id: "d87f8cdd-34b8-40e7-bfd5-e0bdeadaeb61",
              type: "TEXT",
              name: "handle",
              icon: "IconMail",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              relationDefinition: null,
              label: "handle",
              description: "The account handle (email, username, phone number, etc.)"
            },
            {
              id: "545abfa7-5cfa-47c9-9356-02cae33753b3",
              type: "TEXT",
              name: "provider",
              icon: "IconSettings",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              relationDefinition: null,
              label: "provider",
              description: "The account provider"
            },
            {
              id: "189d68c3-2977-4428-85d0-7cda66fe1216",
              type: "TEXT",
              name: "accessToken",
              icon: "IconKey",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              relationDefinition: null,
              label: "Access Token",
              description: "Messaging provider access token"
            },
            {
              id: "90ec419b-10a6-4799-94ca-24ca9fbf5454",
              type: "TEXT",
              name: "refreshToken",
              icon: "IconKey",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              relationDefinition: null,
              label: "Refresh Token",
              description: "Messaging provider refresh token"
            },
            {
              id: "1a637082-4f1e-4dca-ba1c-c9441018813b",
              type: "TEXT",
              name: "lastSyncHistoryId",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              relationDefinition: null,
              label: "Last sync history ID",
              description: "Last sync history ID"
            },
            {
              id: "c544fa7d-aa57-464c-ad4a-513828d58ee8",
              type: "DATE_TIME",
              name: "authFailedAt",
              icon: "IconX",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              relationDefinition: null,
              label: "Auth failed at",
              description: "Auth failed at"
            },
            {
              id: "e36cdd54-7ddb-4d59-a5cb-6fd5e7d5159f",
              type: "TEXT",
              name: "handleAliases",
              icon: "IconMail",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              relationDefinition: null,
              label: "Handle Aliases",
              description: "Handle Aliases"
            },
            {
              id: "85ddbf3e-9bb0-4d9e-b1fe-337c31880bb5",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "daf89f22-fbf0-4cc8-b741-a688594a4ca4",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "3d40d281-b22d-4895-a3fe-4767b6cdb083",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "1c980ae6-afa9-41c8-bf22-c3c34cbac17d",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "59986897-ccc7-47ff-883a-5a40a17656c8",
              type: "UUID",
              name: "accountOwnerId",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              relationDefinition: null,
              label: "Account Owner id (foreign key)",
              description: "Account Owner id foreign key"
            },
            {
              id: "5b5ee04a-32c1-40d4-8c6c-b438b57e8ec4",
              type: "RELATION",
              name: "accountOwner",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              label: "Account Owner",
              description: "Account Owner",
              relationDefinition: {
                relationId: "533d36eb-6d9d-4fef-814b-290742d225a4",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
                  nameSingular: "connectedAccount",
                  namePlural: "connectedAccounts"
                },
                sourceFieldMetadata: {
                  id: "5b5ee04a-32c1-40d4-8c6c-b438b57e8ec4",
                  name: "accountOwner"
                },
                targetObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  id: "70206be3-e771-46bf-a231-ffcebee8d0ed",
                  name: "connectedAccounts"
                }
              }
            },
            {
              id: "54bedea7-cf0b-4b51-9421-784f78e2f9e4",
              type: "RELATION",
              name: "messageChannels",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              label: "Message Channels",
              description: "Message Channels",
              relationDefinition: {
                relationId: "1097c05e-8d91-472b-bd8f-b2649aa514b6",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
                  nameSingular: "connectedAccount",
                  namePlural: "connectedAccounts"
                },
                sourceFieldMetadata: {
                  id: "54bedea7-cf0b-4b51-9421-784f78e2f9e4",
                  name: "messageChannels"
                },
                targetObjectMetadata: {
                  id: "c21d8721-1976-42f6-91a1-c5d4819b128b",
                  nameSingular: "messageChannel",
                  namePlural: "messageChannels"
                },
                targetFieldMetadata: {
                  id: "d34cd44d-9398-4964-a31d-6bf02a568f23",
                  name: "connectedAccount"
                }
              }
            },
            {
              id: "38676f2a-6626-464d-a635-62b18306149c",
              type: "RELATION",
              name: "calendarChannels",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
              label: "Calendar Channels",
              description: "Calendar Channels",
              relationDefinition: {
                relationId: "7318bfe8-0ca4-41c1-86d6-25af816e69e5",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
                  nameSingular: "connectedAccount",
                  namePlural: "connectedAccounts"
                },
                sourceFieldMetadata: {
                  id: "38676f2a-6626-464d-a635-62b18306149c",
                  name: "calendarChannels"
                },
                targetObjectMetadata: {
                  id: "045ab7da-15f7-4955-aa14-19e6f3d05658",
                  nameSingular: "calendarChannel",
                  namePlural: "calendarChannels"
                },
                targetFieldMetadata: {
                  id: "5fd6c818-0ae4-4da2-b749-a2ef37ed6435",
                  name: "connectedAccount"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "0807d2c1-fafe-4dc4-88b0-49767900c7b4",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_7d1b454b2a538273bdb947e848f",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "8b2cdbbc-2991-43d1-9155-a9809dc8848f",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "59986897-ccc7-47ff-883a-5a40a17656c8"
                        }
                      },
                      {
                        node: {
                          id: "fab3d8f0-0cf8-4b13-93af-4d219cb13905",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "1c980ae6-afa9-41c8-bf22-c3c34cbac17d"
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
        node: {
          id: "a71deea3-3f5f-465a-ade9-1a21ae4893ef",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "apiKey",
          namePlural: "apiKeys",
          icon: "IconRobot",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "19a34bbf-68db-4c9d-b986-f570766c54b7",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "API Key",
          labelPlural: "API Keys",
          description: "An API key",
          fieldsList: [
            {
              id: "ac327cd4-e568-4f15-8c90-de662d34875b",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a71deea3-3f5f-465a-ade9-1a21ae4893ef",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "19a34bbf-68db-4c9d-b986-f570766c54b7",
              type: "TEXT",
              name: "name",
              icon: "IconLink",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a71deea3-3f5f-465a-ade9-1a21ae4893ef",
              relationDefinition: null,
              label: "Name",
              description: "ApiKey name"
            },
            {
              id: "627171ee-3358-4aa9-89df-be00e1ba89f7",
              type: "DATE_TIME",
              name: "expiresAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a71deea3-3f5f-465a-ade9-1a21ae4893ef",
              relationDefinition: null,
              label: "Expiration date",
              description: "ApiKey expiration date"
            },
            {
              id: "13665e74-fe71-44d9-885c-2de027841cf9",
              type: "DATE_TIME",
              name: "revokedAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a71deea3-3f5f-465a-ade9-1a21ae4893ef",
              relationDefinition: null,
              label: "Revocation date",
              description: "ApiKey revocation date"
            },
            {
              id: "c8e993c7-cb10-4df3-82d0-0f5e1842af9e",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a71deea3-3f5f-465a-ade9-1a21ae4893ef",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "9844511c-0b02-4767-9099-ae5b66f4f419",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a71deea3-3f5f-465a-ade9-1a21ae4893ef",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "4eab1b2d-8eaf-4fda-ad7d-daa5f33b84b7",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a71deea3-3f5f-465a-ade9-1a21ae4893ef",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            }
          ],
          indexMetadatas: {
            edges: []
          }
        }
      },
      {
        node: {
          id: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "messageChannelMessageAssociation",
          namePlural: "messageChannelMessageAssociations",
          icon: "IconMessage",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "378dcd6d-1d91-474d-8cb2-78ad9cdaa837",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Message Channel Message Association",
          labelPlural: "Message Channel Message Associations",
          description: "Message Synced with a Message Channel",
          fieldsList: [
            {
              id: "97dd8731-b63e-44e2-8d5a-61e12ae80c62",
              type: "TEXT",
              name: "messageExternalId",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
              relationDefinition: null,
              label: "Message External Id",
              description: "Message id from the messaging provider"
            },
            {
              id: "8597bbb2-069d-4a65-8c20-cca30ee77b67",
              type: "TEXT",
              name: "messageThreadExternalId",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
              relationDefinition: null,
              label: "Thread External Id",
              description: "Thread id from the messaging provider"
            },
            {
              id: "5b09745d-1920-420c-bdf0-6e8adc60da23",
              type: "SELECT",
              name: "direction",
              icon: "IconDirection",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'INCOMING'",
              options: [
                {
                  id: "30365b50-eac9-479d-bf5e-999a9655b0bf",
                  color: "green",
                  label: "Incoming",
                  value: "INCOMING",
                  position: 0
                },
                {
                  id: "6defb21c-7326-4cae-bea3-625c0eda76ec",
                  color: "blue",
                  label: "Outgoing",
                  value: "OUTGOING",
                  position: 1
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
              relationDefinition: null,
              label: "Direction",
              description: "Message Direction"
            },
            {
              id: "378dcd6d-1d91-474d-8cb2-78ad9cdaa837",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "ae3938a1-c49d-42c1-9d3a-01d71dbadc49",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "72aea621-48ed-429f-bb98-c64740b739a1",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "c3145043-0331-4e1c-a0f8-6fbf06c3a94d",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "e4916815-31ec-4795-995f-a81e984700bf",
              type: "UUID",
              name: "messageChannelId",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
              relationDefinition: null,
              label: "Message Channel Id id (foreign key)",
              description: "Message Channel Id id foreign key"
            },
            {
              id: "c0e8c2f4-a05d-4269-a7df-51069e0f0ae5",
              type: "RELATION",
              name: "messageChannel",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
              label: "Message Channel Id",
              description: "Message Channel Id",
              relationDefinition: {
                relationId: "0bff6c45-8eb0-40e7-b49f-6ecf27609e5c",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
                  nameSingular: "messageChannelMessageAssociation",
                  namePlural: "messageChannelMessageAssociations"
                },
                sourceFieldMetadata: {
                  id: "c0e8c2f4-a05d-4269-a7df-51069e0f0ae5",
                  name: "messageChannel"
                },
                targetObjectMetadata: {
                  id: "c21d8721-1976-42f6-91a1-c5d4819b128b",
                  nameSingular: "messageChannel",
                  namePlural: "messageChannels"
                },
                targetFieldMetadata: {
                  id: "4328d22a-3482-4a8c-810f-782e10fbc9e4",
                  name: "messageChannelMessageAssociations"
                }
              }
            },
            {
              id: "d2b3a1d4-f271-41f3-b5fe-67ed7b7d7704",
              type: "UUID",
              name: "messageId",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
              relationDefinition: null,
              label: "Message Id id (foreign key)",
              description: "Message Id id foreign key"
            },
            {
              id: "2905cdde-d263-4c7c-8db4-e9da1fdf2925",
              type: "RELATION",
              name: "message",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
              label: "Message Id",
              description: "Message Id",
              relationDefinition: {
                relationId: "2061715e-5818-46f3-b15e-c6664d97637f",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
                  nameSingular: "messageChannelMessageAssociation",
                  namePlural: "messageChannelMessageAssociations"
                },
                sourceFieldMetadata: {
                  id: "2905cdde-d263-4c7c-8db4-e9da1fdf2925",
                  name: "message"
                },
                targetObjectMetadata: {
                  id: "15e17021-5b35-434f-b246-edcb51d583a6",
                  nameSingular: "message",
                  namePlural: "messages"
                },
                targetFieldMetadata: {
                  id: "6bb31032-b051-49f9-a144-98f6a2cae938",
                  name: "messageChannelMessageAssociations"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "67cfb9a1-2038-441b-9cd7-5495a2f729ea",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_671dd9e01a80d1e4c89fc166c3b",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "7d747406-bc3a-4ef1-aa8a-156a5afc1474",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "c3145043-0331-4e1c-a0f8-6fbf06c3a94d"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "b346f385-8dba-450f-82a3-3d6c3903aea9",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_63953e5f88351922043480b8801",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "a6c2d237-9937-4877-bc54-c53dc702269e",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "c3145043-0331-4e1c-a0f8-6fbf06c3a94d"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "77eb45e0-0b8f-4367-bbba-b5fc9899377f",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_UNIQUE_da56d8b595a778d404eae01f29b",
                  indexWhereClause: "\"deletedAt\" IS NULL",
                  indexType: "BTREE",
                  isUnique: true,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "89fc10c0-f863-4214-8cb0-1ba770a5115b",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "d2b3a1d4-f271-41f3-b5fe-67ed7b7d7704"
                        }
                      },
                      {
                        node: {
                          id: "10fb92d5-fc4b-47da-84d5-f4702e165d7e",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "e4916815-31ec-4795-995f-a81e984700bf"
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
        node: {
          id: "a465a29c-94f0-48bb-b394-eb6507e92baa",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "webhook",
          namePlural: "webhooks",
          icon: "IconRobot",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "07ae22fc-afc7-4f6b-ad5f-76138b756766",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Webhook",
          labelPlural: "Webhooks",
          description: "A webhook",
          fieldsList: [
            {
              id: "07ae22fc-afc7-4f6b-ad5f-76138b756766",
              type: "TEXT",
              name: "targetUrl",
              icon: "IconLink",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a465a29c-94f0-48bb-b394-eb6507e92baa",
              relationDefinition: null,
              label: "Target Url",
              description: "Webhook target url"
            },
            {
              id: "e6d585a5-5097-4423-b527-09ea49019405",
              type: "ARRAY",
              name: "operations",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: [
                "*.*"
              ],
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a465a29c-94f0-48bb-b394-eb6507e92baa",
              relationDefinition: null,
              label: "Operations",
              description: "Webhook operations"
            },
            {
              id: "d8c53001-1c7e-4dad-bfa5-6b29988b6feb",
              type: "TEXT",
              name: "description",
              icon: "IconInfo",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a465a29c-94f0-48bb-b394-eb6507e92baa",
              relationDefinition: null,
              label: "Description",
              description: ""
            },
            {
              id: "642ec1f6-42cd-4a3c-b63d-0ca4d3ca3088",
              type: "TEXT",
              name: "secret",
              icon: "IconLock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a465a29c-94f0-48bb-b394-eb6507e92baa",
              relationDefinition: null,
              label: "Secret",
              description: "Optional secret used to compute the HMAC signature for webhook payloads. This secret is shared between Twenty and the webhook consumer to authenticate webhook requests."
            },
            {
              id: "eaeb5834-6e6e-487b-a37e-a30d06ce33db",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "a465a29c-94f0-48bb-b394-eb6507e92baa",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "db4ca71f-dcf9-4ac4-953a-0404d7f3adbd",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a465a29c-94f0-48bb-b394-eb6507e92baa",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "389eadd6-cb7c-4c66-91af-0fd229fe5c4f",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a465a29c-94f0-48bb-b394-eb6507e92baa",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "0ef01897-0c07-4175-8e5a-cfd4f48da640",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "a465a29c-94f0-48bb-b394-eb6507e92baa",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            }
          ],
          indexMetadatas: {
            edges: []
          }
        }
      },
      {
        node: {
          id: "9e0462c6-48db-4894-9436-c6324f43444f",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "opportunity",
          namePlural: "opportunities",
          icon: "IconTargetArrow",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "7af9bd78-d313-4407-8f78-57f486e78050",
          imageIdentifierFieldMetadataId: null,
          shortcut: "O",
          isLabelSyncedWithName: false,
          labelSingular: "Opportunity",
          labelPlural: "Opportunities",
          description: "An opportunity",
          fieldsList: [
            {
              id: "7af9bd78-d313-4407-8f78-57f486e78050",
              type: "TEXT",
              name: "name",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              relationDefinition: null,
              label: "Name",
              description: "The opportunity name"
            },
            {
              id: "a88dc488-17bb-4fbd-84fa-14db033c218d",
              type: "CURRENCY",
              name: "amount",
              icon: "IconCurrencyDollar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                amountMicros: null,
                currencyCode: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              relationDefinition: null,
              label: "Amount",
              description: "Opportunity amount"
            },
            {
              id: "d64d7ac0-31a2-4958-bd5f-2b38672ff7e7",
              type: "DATE_TIME",
              name: "closeDate",
              icon: "IconCalendarEvent",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              relationDefinition: null,
              label: "Close date",
              description: "Opportunity close date"
            },
            {
              id: "e843226d-c058-4818-bda2-2576d00768ad",
              type: "SELECT",
              name: "stage",
              icon: "IconProgressCheck",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'NEW'",
              options: [
                {
                  id: "291c9faf-5d7f-4e44-9c9a-fd4d9f8e7f37",
                  color: "red",
                  label: "New",
                  value: "NEW",
                  position: 0
                },
                {
                  id: "0e3d3900-810f-48c4-819b-36394d807218",
                  color: "purple",
                  label: "Screening",
                  value: "SCREENING",
                  position: 1
                },
                {
                  id: "2551e666-eefc-4fb5-92b2-a93d6f9884a6",
                  color: "sky",
                  label: "Meeting",
                  value: "MEETING",
                  position: 2
                },
                {
                  id: "c424478d-91f7-4f25-8d84-4921c54da8c4",
                  color: "turquoise",
                  label: "Proposal",
                  value: "PROPOSAL",
                  position: 3
                },
                {
                  id: "946fdd54-2899-4624-b44e-426962619da5",
                  color: "yellow",
                  label: "Customer",
                  value: "CUSTOMER",
                  position: 4
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              relationDefinition: null,
              label: "Stage",
              description: "Opportunity stage"
            },
            {
              id: "773146a5-a071-4dee-bea1-5adc8bbffb2d",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              relationDefinition: null,
              label: "Position",
              description: "Opportunity record position"
            },
            {
              id: "19025241-8916-48e9-9909-17d0284f9155",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              id: "5284d95d-e8f7-4c62-bf21-ef7876a7a555",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              id: "9a6c8607-f138-4ac4-b277-ed0c493e2d6e",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "cb4ead1c-f15e-4ffb-9980-a0594ef6c49c",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "7060efcf-0316-42fe-a08b-db802b30f14b",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "c33a3bac-1b91-4af6-aa53-0042664c9153",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "fb79c692-b1dd-4fd2-a9ce-48c7e47ceca2",
              type: "UUID",
              name: "pointOfContactId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              relationDefinition: null,
              label: "Point of Contact id (foreign key)",
              description: "Opportunity point of contact id foreign key"
            },
            {
              id: "51f58992-fe8d-456d-b42c-a229ffacbf15",
              type: "RELATION",
              name: "pointOfContact",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              label: "Point of Contact",
              description: "Opportunity point of contact",
              relationDefinition: {
                relationId: "8265433c-df28-4294-8d52-891206126568",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  id: "51f58992-fe8d-456d-b42c-a229ffacbf15",
                  name: "pointOfContact"
                },
                targetObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  id: "e27e1658-71fb-4920-ae58-dc7b6ddb4687",
                  name: "pointOfContactForOpportunities"
                }
              }
            },
            {
              id: "1190e6ce-8e49-48cf-869b-c3368108aa41",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "Opportunity company id foreign key"
            },
            {
              id: "5b0a215c-8d4d-4568-b900-179cee0bd0b8",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              label: "Company",
              description: "Opportunity company",
              relationDefinition: {
                relationId: "248547d8-84ac-407b-9331-44510856a189",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  id: "5b0a215c-8d4d-4568-b900-179cee0bd0b8",
                  name: "company"
                },
                targetObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  id: "d63badc4-81b3-4077-811c-8b6eebaf8104",
                  name: "opportunities"
                }
              }
            },
            {
              id: "b3db8b78-69f1-4f19-8630-780e27345246",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              label: "Favorites",
              description: "Favorites linked to the opportunity",
              relationDefinition: {
                relationId: "72c989d7-7560-4eac-a235-46fdde9a989a",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  id: "b3db8b78-69f1-4f19-8630-780e27345246",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  id: "6c33db09-4333-4487-973a-c7bad7b692a9",
                  name: "opportunity"
                }
              }
            },
            {
              id: "d63a1434-28dc-4d42-b0ee-0ee1242cc20f",
              type: "RELATION",
              name: "taskTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              label: "Tasks",
              description: "Tasks tied to the opportunity",
              relationDefinition: {
                relationId: "76219159-cee2-45fb-b4a9-ca2ebd27301f",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  id: "d63a1434-28dc-4d42-b0ee-0ee1242cc20f",
                  name: "taskTargets"
                },
                targetObjectMetadata: {
                  id: "69a22300-9109-4eca-a926-1e26a86f674a",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                targetFieldMetadata: {
                  id: "ca3781bd-1d3e-4c8f-b27e-108634a7503e",
                  name: "opportunity"
                }
              }
            },
            {
              id: "35b9780d-a249-42e0-a863-009f24ca37c2",
              type: "RELATION",
              name: "noteTargets",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              label: "Notes",
              description: "Notes tied to the opportunity",
              relationDefinition: {
                relationId: "7d1de0a0-03a1-4df3-9baf-da94793a23e8",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  id: "35b9780d-a249-42e0-a863-009f24ca37c2",
                  name: "noteTargets"
                },
                targetObjectMetadata: {
                  id: "8f7f73af-32c4-4dcb-ba89-60829345d803",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                targetFieldMetadata: {
                  id: "96b65916-2345-4c80-a600-ee69de0f45d9",
                  name: "opportunity"
                }
              }
            },
            {
              id: "2ab93f6f-e87d-425b-9934-38760687bf0a",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              label: "Attachments",
              description: "Attachments linked to the opportunity",
              relationDefinition: {
                relationId: "38f3831f-6ac8-42eb-b5b9-a77a253064fd",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  id: "2ab93f6f-e87d-425b-9934-38760687bf0a",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  id: "47d2d7c6-1419-4678-9201-239b0a789ff6",
                  name: "opportunity"
                }
              }
            },
            {
              id: "cd8cc64a-22f0-46b1-9adf-0b5da3e74bd2",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "9e0462c6-48db-4894-9436-c6324f43444f",
              label: "Timeline Activities",
              description: "Timeline Activities linked to the opportunity.",
              relationDefinition: {
                relationId: "3dcefe3e-7ebb-4cf6-92b8-0989fdd0fb91",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                sourceFieldMetadata: {
                  id: "cd8cc64a-22f0-46b1-9adf-0b5da3e74bd2",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  id: "29299a5d-d4b6-4e21-9778-4a2ad05e2d8a",
                  name: "opportunity"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "9a76163d-fa8d-43e8-b78f-125f682d5e77",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_9f96d65260c4676faac27cb6bf3",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "716fc79b-3fff-435c-8659-d54155fa2fcb",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "5284d95d-e8f7-4c62-bf21-ef7876a7a555"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "101f7981-9e27-4a51-ab71-6118a60cf2b6",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_425ac6c73ecb993cf9cbc2c2b00",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "4e437610-74af-4894-bd63-25b17a95a10a",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "c33a3bac-1b91-4af6-aa53-0042664c9153"
                        }
                      },
                      {
                        node: {
                          id: "62d99acf-25c3-4a37-8979-05d498e6fd87",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "1190e6ce-8e49-48cf-869b-c3368108aa41"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "99b37cc3-260b-47c9-9c1a-12820bb0cacf",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_82cdf247553f960093baa7c6635",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "2befb0fd-4869-43fe-a185-985f93fea9ee",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "fb79c692-b1dd-4fd2-a9ce-48c7e47ceca2"
                        }
                      },
                      {
                        node: {
                          id: "286fff5d-b75a-47ff-af8d-e0c7e176468f",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "c33a3bac-1b91-4af6-aa53-0042664c9153"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "54d64cb1-2460-490c-864d-1d19d5a6e66d",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_4f469d3a7ee08aefdc099836364",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "e4a7a2d2-ebe8-4920-9b27-cd7b45a3a4f6",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "c33a3bac-1b91-4af6-aa53-0042664c9153"
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
        node: {
          id: "8f7f73af-32c4-4dcb-ba89-60829345d803",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "noteTarget",
          namePlural: "noteTargets",
          icon: "IconCheckbox",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "6ec3f396-962f-4326-83cd-cde7fd0f4b48",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Note Target",
          labelPlural: "Note Targets",
          description: "A note target",
          fieldsList: [
            {
              id: "6ec3f396-962f-4326-83cd-cde7fd0f4b48",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "9469aab4-1cde-4c0c-bea2-c765cc755973",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "e480073e-dfaa-45e3-ad62-8cb2834db709",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "b8e46e00-2da2-43d6-842a-491967095d3f",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "24816acd-52cb-43e4-aeec-76d1f6fe75ff",
              type: "UUID",
              name: "noteId",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              relationDefinition: null,
              label: "Note id (foreign key)",
              description: "NoteTarget note id foreign key"
            },
            {
              id: "af41c4d0-2f48-4259-8de4-1d63abc3b92d",
              type: "RELATION",
              name: "note",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              label: "Note",
              description: "NoteTarget note",
              relationDefinition: {
                relationId: "c35e7b84-25b8-4d13-96ab-cefcaf29a6f6",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "8f7f73af-32c4-4dcb-ba89-60829345d803",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                sourceFieldMetadata: {
                  id: "af41c4d0-2f48-4259-8de4-1d63abc3b92d",
                  name: "note"
                },
                targetObjectMetadata: {
                  id: "11404ff2-0997-45dc-8efd-6ba08c12e150",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                targetFieldMetadata: {
                  id: "4d03c705-2f4c-49e1-9f9c-74da9925f72c",
                  name: "noteTargets"
                }
              }
            },
            {
              id: "2e90f7a4-8e89-4d12-a338-cd186008f015",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "NoteTarget person id foreign key"
            },
            {
              id: "ada0798d-702c-4beb-bdb8-3226de611145",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              label: "Person",
              description: "NoteTarget person",
              relationDefinition: {
                relationId: "0a7abacf-b8e6-494c-9f50-a68b90febff5",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "8f7f73af-32c4-4dcb-ba89-60829345d803",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                sourceFieldMetadata: {
                  id: "ada0798d-702c-4beb-bdb8-3226de611145",
                  name: "person"
                },
                targetObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  id: "beb7f34c-dc86-4c0d-92a7-f978ffd64d7f",
                  name: "noteTargets"
                }
              }
            },
            {
              id: "2b1174ae-bb8f-4e9a-baea-c07ac74476ce",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "NoteTarget company id foreign key"
            },
            {
              id: "f4cdc05f-b367-4e14-abec-041804a933b2",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              label: "Company",
              description: "NoteTarget company",
              relationDefinition: {
                relationId: "ebaade58-c7e5-4dbd-9316-d83099b85ae4",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "8f7f73af-32c4-4dcb-ba89-60829345d803",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                sourceFieldMetadata: {
                  id: "f4cdc05f-b367-4e14-abec-041804a933b2",
                  name: "company"
                },
                targetObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  id: "acee4d4a-7906-466e-b2f8-7437278db023",
                  name: "noteTargets"
                }
              }
            },
            {
              id: "d18e1862-e4df-47e2-865c-615e1434ddf4",
              type: "UUID",
              name: "opportunityId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              relationDefinition: null,
              label: "Opportunity id (foreign key)",
              description: "NoteTarget opportunity id foreign key"
            },
            {
              id: "96b65916-2345-4c80-a600-ee69de0f45d9",
              type: "RELATION",
              name: "opportunity",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              label: "Opportunity",
              description: "NoteTarget opportunity",
              relationDefinition: {
                relationId: "7d1de0a0-03a1-4df3-9baf-da94793a23e8",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "8f7f73af-32c4-4dcb-ba89-60829345d803",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                sourceFieldMetadata: {
                  id: "96b65916-2345-4c80-a600-ee69de0f45d9",
                  name: "opportunity"
                },
                targetObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  id: "35b9780d-a249-42e0-a863-009f24ca37c2",
                  name: "noteTargets"
                }
              }
            },
            {
              id: "fc6b4de9-961e-4cdf-b644-05eb0fffec98",
              type: "RELATION",
              name: "pet",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.271Z",
              updatedAt: "2025-02-07T10:58:03.271Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              label: "Pet",
              description: "NoteTargets Pet",
              relationDefinition: {
                relationId: "5c0e8fa2-a2b7-4f5b-8c5a-aeceb96f1379",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "8f7f73af-32c4-4dcb-ba89-60829345d803",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                sourceFieldMetadata: {
                  id: "fc6b4de9-961e-4cdf-b644-05eb0fffec98",
                  name: "pet"
                },
                targetObjectMetadata: {
                  id: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                targetFieldMetadata: {
                  id: "729dc846-c714-4f06-98c9-249d61e0ec48",
                  name: "noteTargets"
                }
              }
            },
            {
              id: "7d9b3f25-9bb3-4078-9bd3-55c3f7e7b853",
              type: "UUID",
              name: "petId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.271Z",
              updatedAt: "2025-02-07T10:58:03.271Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              relationDefinition: null,
              label: "Pet ID (foreign key)",
              description: "Note Target Pet id foreign key"
            },
            {
              id: "53b9093e-7489-45d4-af7f-1e6fc89cb44c",
              type: "RELATION",
              name: "surveyResult",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.975Z",
              updatedAt: "2025-02-07T10:58:03.975Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              label: "Survey result",
              description: "NoteTargets Survey result",
              relationDefinition: {
                relationId: "3b9309bf-af5e-4761-9fad-c4e7ccdb9a42",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "8f7f73af-32c4-4dcb-ba89-60829345d803",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                sourceFieldMetadata: {
                  id: "53b9093e-7489-45d4-af7f-1e6fc89cb44c",
                  name: "surveyResult"
                },
                targetObjectMetadata: {
                  id: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                targetFieldMetadata: {
                  id: "f31f394e-9fa4-4385-a8d3-1284fe7304b9",
                  name: "noteTargets"
                }
              }
            },
            {
              id: "66ab2df7-b610-47fc-9328-b15bcc86aa9f",
              type: "UUID",
              name: "surveyResultId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.975Z",
              updatedAt: "2025-02-07T10:58:03.975Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "8f7f73af-32c4-4dcb-ba89-60829345d803",
              relationDefinition: null,
              label: "Survey result ID (foreign key)",
              description: "Note Target Survey result id foreign key"
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "2f92969b-abcf-4eef-ba4e-c5739cab62fa",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_56454973bce16e65ee1ae3d2e40",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "f679c713-4141-41f0-bf7a-db01d4c45c7a",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "b8e46e00-2da2-43d6-842a-491967095d3f"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "19d1bfbf-4d94-460e-8362-2ea7069d103c",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_19ea95ddb39f610f7dcad4c4336",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "7d073684-2180-4ac5-830f-07dd2a0b92a3",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "b8e46e00-2da2-43d6-842a-491967095d3f"
                        }
                      },
                      {
                        node: {
                          id: "e7fccafd-31cb-4a92-be97-125170a333cd",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "d18e1862-e4df-47e2-865c-615e1434ddf4"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "28498346-63b2-4716-b1cc-474854198117",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_241f0cca089399c8c5954086b8d",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "2307d016-dd47-4c05-8f79-b67fe641aa52",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "b8e46e00-2da2-43d6-842a-491967095d3f"
                        }
                      },
                      {
                        node: {
                          id: "ddaa9bc2-89b3-45b3-b331-3573378f809b",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "24816acd-52cb-43e4-aeec-76d1f6fe75ff"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "e97dab78-d574-4328-9e15-bf322cb576a2",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_68bce49f4de05facd5365a3a797",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "346753c9-7c60-4ec8-8a2a-5f4c3dc53e3d",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "2b1174ae-bb8f-4e9a-baea-c07ac74476ce"
                        }
                      },
                      {
                        node: {
                          id: "0f95fb52-a923-4189-bf69-bf6755c4adc6",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "b8e46e00-2da2-43d6-842a-491967095d3f"
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
        node: {
          id: "863af123-7089-424e-9bf9-face9412f4bb",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "calendarEvent",
          namePlural: "calendarEvents",
          icon: "IconCalendar",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "7617d5eb-734a-4c6d-b176-63ed8ec62866",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Calendar event",
          labelPlural: "Calendar events",
          description: "Calendar events",
          fieldsList: [
            {
              id: "7617d5eb-734a-4c6d-b176-63ed8ec62866",
              type: "TEXT",
              name: "title",
              icon: "IconH1",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Title",
              description: "Title"
            },
            {
              id: "cbbc8b75-b6d1-41a7-8a93-812ed2838b96",
              type: "BOOLEAN",
              name: "isCanceled",
              icon: "IconCalendarCancel",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: false,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Is canceled",
              description: "Is canceled"
            },
            {
              id: "48c901f4-aa75-4d0d-bd66-27c34c01c47b",
              type: "BOOLEAN",
              name: "isFullDay",
              icon: "Icon24Hours",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: false,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Is Full Day",
              description: "Is Full Day"
            },
            {
              id: "93fa4eb2-feaa-4482-aded-8fa0ab4a76f8",
              type: "DATE_TIME",
              name: "startsAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Start Date",
              description: "Start Date"
            },
            {
              id: "77440efb-a0d8-43b5-9412-ab961c094d3c",
              type: "DATE_TIME",
              name: "endsAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "End Date",
              description: "End Date"
            },
            {
              id: "ade39d7d-767d-4531-aded-fd3786d89a72",
              type: "DATE_TIME",
              name: "externalCreatedAt",
              icon: "IconCalendarPlus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Creation DateTime",
              description: "Creation DateTime"
            },
            {
              id: "56431c9e-43e3-4be1-9db0-db7c9a711dc9",
              type: "DATE_TIME",
              name: "externalUpdatedAt",
              icon: "IconCalendarCog",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Update DateTime",
              description: "Update DateTime"
            },
            {
              id: "178a41a0-1c0b-4f35-8019-1ef3c30fb76c",
              type: "TEXT",
              name: "description",
              icon: "IconFileDescription",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Description",
              description: "Description"
            },
            {
              id: "a03ae24d-05fb-44e5-b036-4f71caaf9196",
              type: "TEXT",
              name: "location",
              icon: "IconMapPin",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Location",
              description: "Location"
            },
            {
              id: "ed29d73b-5b77-4bdf-a5b0-b0e41dc6a378",
              type: "TEXT",
              name: "iCalUID",
              icon: "IconKey",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "iCal UID",
              description: "iCal UID"
            },
            {
              id: "99935cb8-955b-4826-8f69-798361aa297c",
              type: "TEXT",
              name: "conferenceSolution",
              icon: "IconScreenShare",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Conference Solution",
              description: "Conference Solution"
            },
            {
              id: "115448f2-295a-49a6-80be-40e48be2c5b2",
              type: "LINKS",
              name: "conferenceLink",
              icon: "IconLink",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Meet Link",
              description: "Meet Link"
            },
            {
              id: "42a939ce-39bb-470b-bbbd-8b3694d8feb0",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "f71b3e59-22de-42b1-a9eb-f05ff0c2f035",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "1369f001-333b-4433-8baa-74b382a9ff92",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "32e20704-3c44-4beb-925e-19933ba9e023",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "92249e83-d6a8-4d96-94b9-e31fe7c80151",
              type: "RELATION",
              name: "calendarChannelEventAssociations",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              label: "Calendar Channel Event Associations",
              description: "Calendar Channel Event Associations",
              relationDefinition: {
                relationId: "1023519e-34b5-4ce3-a085-b69c3da59ab5",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "863af123-7089-424e-9bf9-face9412f4bb",
                  nameSingular: "calendarEvent",
                  namePlural: "calendarEvents"
                },
                sourceFieldMetadata: {
                  id: "92249e83-d6a8-4d96-94b9-e31fe7c80151",
                  name: "calendarChannelEventAssociations"
                },
                targetObjectMetadata: {
                  id: "312b58cf-04ab-438a-9c11-c0a4a712b718",
                  nameSingular: "calendarChannelEventAssociation",
                  namePlural: "calendarChannelEventAssociations"
                },
                targetFieldMetadata: {
                  id: "e5405a2b-acdc-43da-b02a-ef1ade0bd7b4",
                  name: "calendarEvent"
                }
              }
            },
            {
              id: "e3dff08a-c697-48b3-a5ae-24f2dd1e1b5d",
              type: "RELATION",
              name: "calendarEventParticipants",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "863af123-7089-424e-9bf9-face9412f4bb",
              label: "Event Participants",
              description: "Event Participants",
              relationDefinition: {
                relationId: "091de895-59b1-4855-bfd5-666a666164d8",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "863af123-7089-424e-9bf9-face9412f4bb",
                  nameSingular: "calendarEvent",
                  namePlural: "calendarEvents"
                },
                sourceFieldMetadata: {
                  id: "e3dff08a-c697-48b3-a5ae-24f2dd1e1b5d",
                  name: "calendarEventParticipants"
                },
                targetObjectMetadata: {
                  id: "2470a60f-1133-4a14-8374-5f74eb244afe",
                  nameSingular: "calendarEventParticipant",
                  namePlural: "calendarEventParticipants"
                },
                targetFieldMetadata: {
                  id: "48a7df41-5153-4814-a151-b50c6180928a",
                  name: "calendarEvent"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: []
          }
        }
      },
      {
        node: {
          id: "7d618ca1-1604-4082-94b7-0c105874aa8b",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "messageFolder",
          namePlural: "messageFolders",
          icon: "IconFolder",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "ec177b3b-44a9-4230-bd63-0bbdcd439a4b",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Message Folder",
          labelPlural: "Message Folders",
          description: "Folder for Message Channel",
          fieldsList: [
            {
              id: "71834043-ce8b-4abc-91f1-a4de2b9d4816",
              type: "TEXT",
              name: "name",
              icon: "IconFolder",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "7d618ca1-1604-4082-94b7-0c105874aa8b",
              relationDefinition: null,
              label: "Name",
              description: "Folder name"
            },
            {
              id: "727e201b-2195-4add-9e7a-a1934e98741d",
              type: "TEXT",
              name: "syncCursor",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "7d618ca1-1604-4082-94b7-0c105874aa8b",
              relationDefinition: null,
              label: "Sync Cursor",
              description: "Sync Cursor"
            },
            {
              id: "ec177b3b-44a9-4230-bd63-0bbdcd439a4b",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "7d618ca1-1604-4082-94b7-0c105874aa8b",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "a791f3f3-ce54-46a3-b088-289dad7d2233",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "7d618ca1-1604-4082-94b7-0c105874aa8b",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "a044f8b4-b165-464e-acd9-63b0ef19ade5",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "7d618ca1-1604-4082-94b7-0c105874aa8b",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "5f84b905-bf21-4560-95ca-e4dd243cf30b",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "7d618ca1-1604-4082-94b7-0c105874aa8b",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "93cc5804-9f9f-4a6a-bb1b-263da684e744",
              type: "UUID",
              name: "messageChannelId",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "7d618ca1-1604-4082-94b7-0c105874aa8b",
              relationDefinition: null,
              label: "Message Channel id (foreign key)",
              description: "Message Channel id foreign key"
            },
            {
              id: "4ebfd6d3-d223-4702-9f1a-ec95ba1a7dd9",
              type: "RELATION",
              name: "messageChannel",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "7d618ca1-1604-4082-94b7-0c105874aa8b",
              label: "Message Channel",
              description: "Message Channel",
              relationDefinition: {
                relationId: "e470cdd1-4011-4cb7-aab3-c5a7524f157b",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "7d618ca1-1604-4082-94b7-0c105874aa8b",
                  nameSingular: "messageFolder",
                  namePlural: "messageFolders"
                },
                sourceFieldMetadata: {
                  id: "4ebfd6d3-d223-4702-9f1a-ec95ba1a7dd9",
                  name: "messageChannel"
                },
                targetObjectMetadata: {
                  id: "c21d8721-1976-42f6-91a1-c5d4819b128b",
                  nameSingular: "messageChannel",
                  namePlural: "messageChannels"
                },
                targetFieldMetadata: {
                  id: "3b520a79-1141-4521-9927-7cd491f2a3d9",
                  name: "messageFolders"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "739f0738-e56b-43f1-afd4-ef5eafe4f293",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_8606361c00c3d44e1a23024e1f8",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "5406a1ed-ece4-469a-a214-a9189c8f413b",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "93cc5804-9f9f-4a6a-bb1b-263da684e744"
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
        node: {
          id: "74a86d25-7bee-4b08-b23b-fbbb8a66001d",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "messageThread",
          namePlural: "messageThreads",
          icon: "IconMessage",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "9ce805f6-363c-4a6e-a8e3-f4741961672c",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Message Thread",
          labelPlural: "Message Threads",
          description: "A group of related messages (e.g. email thread, chat thread)",
          fieldsList: [
            {
              id: "9ce805f6-363c-4a6e-a8e3-f4741961672c",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "74a86d25-7bee-4b08-b23b-fbbb8a66001d",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "1e50fdec-7061-4e98-98f9-b173052e8d45",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "74a86d25-7bee-4b08-b23b-fbbb8a66001d",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "abb15832-683a-42eb-87d7-27bc60b15efc",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "74a86d25-7bee-4b08-b23b-fbbb8a66001d",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "ed67ae3b-cd05-4e56-b8b6-5e6654afe0b8",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "74a86d25-7bee-4b08-b23b-fbbb8a66001d",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "e336b591-f67a-4f17-8622-c8d3a69b47b9",
              type: "RELATION",
              name: "messages",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "74a86d25-7bee-4b08-b23b-fbbb8a66001d",
              label: "Messages",
              description: "Messages from the thread.",
              relationDefinition: {
                relationId: "0ac501bc-cf38-4b8d-a6be-2240aca8d002",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "74a86d25-7bee-4b08-b23b-fbbb8a66001d",
                  nameSingular: "messageThread",
                  namePlural: "messageThreads"
                },
                sourceFieldMetadata: {
                  id: "e336b591-f67a-4f17-8622-c8d3a69b47b9",
                  name: "messages"
                },
                targetObjectMetadata: {
                  id: "15e17021-5b35-434f-b246-edcb51d583a6",
                  nameSingular: "message",
                  namePlural: "messages"
                },
                targetFieldMetadata: {
                  id: "66fa3f43-dba8-4e05-b019-737e2b601333",
                  name: "messageThread"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: []
          }
        }
      },
      {
        node: {
          id: "69a22300-9109-4eca-a926-1e26a86f674a",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "taskTarget",
          namePlural: "taskTargets",
          icon: "IconCheckbox",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "4ed082f5-742c-4ac9-9b3b-e6f5aefd1fb3",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Task Target",
          labelPlural: "Task Targets",
          description: "A task target",
          fieldsList: [
            {
              id: "4ed082f5-742c-4ac9-9b3b-e6f5aefd1fb3",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "bf5e66f7-734c-48f6-94ca-54adc4cca2f5",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "aae0c538-11b1-401c-8e82-613ad68e3528",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "3b6bd6b8-667c-405d-813e-dffd7e960ff9",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "f882c3ab-1439-459c-8e95-920a2cbdade6",
              type: "UUID",
              name: "taskId",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              relationDefinition: null,
              label: "Task id (foreign key)",
              description: "TaskTarget task id foreign key"
            },
            {
              id: "f6afd1ec-916d-4d82-b363-f0e828af2d60",
              type: "RELATION",
              name: "task",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              label: "Task",
              description: "TaskTarget task",
              relationDefinition: {
                relationId: "59f93745-3b1a-4e28-ba15-cd758bfd9bc9",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "69a22300-9109-4eca-a926-1e26a86f674a",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                sourceFieldMetadata: {
                  id: "f6afd1ec-916d-4d82-b363-f0e828af2d60",
                  name: "task"
                },
                targetObjectMetadata: {
                  id: "24c7b746-68be-40da-8189-8b7ace3d09c8",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                targetFieldMetadata: {
                  id: "ad40f3e4-cb44-46b5-893f-46e049c841b5",
                  name: "taskTargets"
                }
              }
            },
            {
              id: "166e3e61-2f89-4914-a710-52244e7ffcdb",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "TaskTarget person id foreign key"
            },
            {
              id: "9bf3a389-28f7-40ad-b239-b4f27c2944ea",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              label: "Person",
              description: "TaskTarget person",
              relationDefinition: {
                relationId: "7bd08914-243c-4f03-9589-62d381c911f8",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "69a22300-9109-4eca-a926-1e26a86f674a",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                sourceFieldMetadata: {
                  id: "9bf3a389-28f7-40ad-b239-b4f27c2944ea",
                  name: "person"
                },
                targetObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  id: "25040460-f26e-448b-b24d-7d4ef34ac604",
                  name: "taskTargets"
                }
              }
            },
            {
              id: "5c352717-0f13-410f-a99d-1ed223b76ba0",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "TaskTarget company id foreign key"
            },
            {
              id: "e876a8e4-1c94-483d-8240-c9c303a86ecc",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              label: "Company",
              description: "TaskTarget company",
              relationDefinition: {
                relationId: "b967b8fe-7328-4b1a-8a0c-7c36a83c140d",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "69a22300-9109-4eca-a926-1e26a86f674a",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                sourceFieldMetadata: {
                  id: "e876a8e4-1c94-483d-8240-c9c303a86ecc",
                  name: "company"
                },
                targetObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  id: "efe4fff5-6405-460e-acea-664871aa875f",
                  name: "taskTargets"
                }
              }
            },
            {
              id: "0a99a3a5-56ea-47fc-90b5-6598bba9c5a7",
              type: "UUID",
              name: "opportunityId",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              relationDefinition: null,
              label: "Opportunity id (foreign key)",
              description: "TaskTarget opportunity id foreign key"
            },
            {
              id: "ca3781bd-1d3e-4c8f-b27e-108634a7503e",
              type: "RELATION",
              name: "opportunity",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              label: "Opportunity",
              description: "TaskTarget opportunity",
              relationDefinition: {
                relationId: "76219159-cee2-45fb-b4a9-ca2ebd27301f",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "69a22300-9109-4eca-a926-1e26a86f674a",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                sourceFieldMetadata: {
                  id: "ca3781bd-1d3e-4c8f-b27e-108634a7503e",
                  name: "opportunity"
                },
                targetObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  id: "d63a1434-28dc-4d42-b0ee-0ee1242cc20f",
                  name: "taskTargets"
                }
              }
            },
            {
              id: "757e8740-4843-4fad-bfb0-cc321d982fb1",
              type: "RELATION",
              name: "pet",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.269Z",
              updatedAt: "2025-02-07T10:58:03.269Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              label: "Pet",
              description: "TaskTargets Pet",
              relationDefinition: {
                relationId: "6482041c-c583-43d0-8da2-6209576491fd",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "69a22300-9109-4eca-a926-1e26a86f674a",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                sourceFieldMetadata: {
                  id: "757e8740-4843-4fad-bfb0-cc321d982fb1",
                  name: "pet"
                },
                targetObjectMetadata: {
                  id: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                targetFieldMetadata: {
                  id: "f709ba2b-be94-474e-8b06-bc9974a5c7ef",
                  name: "taskTargets"
                }
              }
            },
            {
              id: "16c9dbd0-f399-474f-bf0d-b548913c1f80",
              type: "UUID",
              name: "petId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.269Z",
              updatedAt: "2025-02-07T10:58:03.269Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              relationDefinition: null,
              label: "Pet ID (foreign key)",
              description: "Task Target Pet id foreign key"
            },
            {
              id: "f7aaeed9-378f-482f-bea1-910c01e932b3",
              type: "RELATION",
              name: "surveyResult",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.975Z",
              updatedAt: "2025-02-07T10:58:03.975Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              label: "Survey result",
              description: "TaskTargets Survey result",
              relationDefinition: {
                relationId: "1bacfee5-2345-4663-83b5-a32f219fcaca",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "69a22300-9109-4eca-a926-1e26a86f674a",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                sourceFieldMetadata: {
                  id: "f7aaeed9-378f-482f-bea1-910c01e932b3",
                  name: "surveyResult"
                },
                targetObjectMetadata: {
                  id: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                targetFieldMetadata: {
                  id: "a354d48b-31d1-4c11-a4d2-b9d772125223",
                  name: "taskTargets"
                }
              }
            },
            {
              id: "44000d5d-a29b-40ad-a02b-00a41d0cb274",
              type: "UUID",
              name: "surveyResultId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.975Z",
              updatedAt: "2025-02-07T10:58:03.975Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "69a22300-9109-4eca-a926-1e26a86f674a",
              relationDefinition: null,
              label: "Survey result ID (foreign key)",
              description: "Task Target Survey result id foreign key"
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "c2e26721-d1d6-4a89-9eb6-8114d6e4c377",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_b0ba7efcd8c529922bf6e858bc1",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "203a0eef-1fae-4a36-a438-f84412ae4064",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "3b6bd6b8-667c-405d-813e-dffd7e960ff9"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "fa53e6aa-e5df-4495-bcf2-cada77d058e0",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_cf12e6c92058f11b59852ffdfe3",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "c5e1ce04-0dd3-4942-8dfd-18b19e5dcd17",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "3b6bd6b8-667c-405d-813e-dffd7e960ff9"
                        }
                      },
                      {
                        node: {
                          id: "c8e7eda5-bf2a-4a96-981f-d7d6045f1971",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "166e3e61-2f89-4914-a710-52244e7ffcdb"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "5a95c0c4-1bb6-4a77-a2c6-96bf70cf8c14",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_4e929e3af362914c41035c4d438",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "2d970c0a-7a7b-41fa-b8d5-a78f606618da",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "3b6bd6b8-667c-405d-813e-dffd7e960ff9"
                        }
                      },
                      {
                        node: {
                          id: "f4536431-ef2b-4ff5-83da-185b9af6cc9a",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "5c352717-0f13-410f-a99d-1ed223b76ba0"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "58760dce-b31b-462c-a984-dd992b855f23",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_627d4437c96f22d5d46cc9a85bb",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "3f457aa5-f67d-4e7e-9d5e-f9e96773723a",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "f882c3ab-1439-459c-8e95-920a2cbdade6"
                        }
                      },
                      {
                        node: {
                          id: "6e1a4cdc-1efb-4d2b-a55f-424c75a4c542",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "3b6bd6b8-667c-405d-813e-dffd7e960ff9"
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
        node: {
          id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "attachment",
          namePlural: "attachments",
          icon: "IconFileImport",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "fa5285db-c675-4498-aad4-f66c399d04c5",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Attachment",
          labelPlural: "Attachments",
          description: "An attachment",
          fieldsList: [
            {
              id: "fa5285db-c675-4498-aad4-f66c399d04c5",
              type: "TEXT",
              name: "name",
              icon: "IconFileUpload",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Name",
              description: "Attachment name"
            },
            {
              id: "632f2649-1a9b-481c-9fd4-b9772347eb63",
              type: "TEXT",
              name: "fullPath",
              icon: "IconLink",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Full path",
              description: "Attachment full path"
            },
            {
              id: "72d10f19-b1e9-47d5-9994-14baa807b68a",
              type: "TEXT",
              name: "type",
              icon: "IconList",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Type",
              description: "Attachment type"
            },
            {
              id: "9d409a37-ca42-41fc-bea6-fac7ce383f20",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "c70fd382-4cca-4e91-b804-8afd1b1e0129",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "a46b3097-8d7e-43e7-aacf-4df6a06d2040",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "2fc55329-0d00-43ec-9c52-cd94252db7f3",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "e5e36863-889b-48f2-a9e0-3ed253e03a5c",
              type: "UUID",
              name: "authorId",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Author id (foreign key)",
              description: "Attachment author id foreign key"
            },
            {
              id: "a6ff9bb1-537e-4fa5-ad5f-710304d17f7c",
              type: "RELATION",
              name: "author",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              label: "Author",
              description: "Attachment author",
              relationDefinition: {
                relationId: "975ced5d-8fc4-42e3-9740-1f9a7218dc33",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  id: "a6ff9bb1-537e-4fa5-ad5f-710304d17f7c",
                  name: "author"
                },
                targetObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  id: "12842f5c-176a-4364-b64e-d64b4ed7f8ad",
                  name: "authoredAttachments"
                }
              }
            },
            {
              id: "5bc3bcc8-8b6e-4b15-a81c-3d54a9fbeea3",
              type: "UUID",
              name: "taskId",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Task id (foreign key)",
              description: "Attachment task id foreign key"
            },
            {
              id: "e0b48fe7-6be3-4813-b3fe-22f43ffb37b7",
              type: "RELATION",
              name: "task",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              label: "Task",
              description: "Attachment task",
              relationDefinition: {
                relationId: "1cee091d-865a-4e83-9d8c-04e043b49e08",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  id: "e0b48fe7-6be3-4813-b3fe-22f43ffb37b7",
                  name: "task"
                },
                targetObjectMetadata: {
                  id: "24c7b746-68be-40da-8189-8b7ace3d09c8",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                targetFieldMetadata: {
                  id: "9ab851fd-dd90-4153-92a0-da9a9b689dd9",
                  name: "attachments"
                }
              }
            },
            {
              id: "ec63f399-dfcb-42fb-b224-1e3dd67b21fc",
              type: "UUID",
              name: "noteId",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Note id (foreign key)",
              description: "Attachment note id foreign key"
            },
            {
              id: "a323d73b-ef09-4017-9c67-3210ea9771bf",
              type: "RELATION",
              name: "note",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              label: "Note",
              description: "Attachment note",
              relationDefinition: {
                relationId: "842a844a-90a1-4835-9268-4a586ac3f073",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  id: "a323d73b-ef09-4017-9c67-3210ea9771bf",
                  name: "note"
                },
                targetObjectMetadata: {
                  id: "11404ff2-0997-45dc-8efd-6ba08c12e150",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                targetFieldMetadata: {
                  id: "a8b515aa-d9e2-4178-a862-d7aed28c100e",
                  name: "attachments"
                }
              }
            },
            {
              id: "f9b406f9-7ede-439c-aa74-1d6b97b8038d",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "Attachment person id foreign key"
            },
            {
              id: "4b31012b-6f6d-4c78-885f-448785d6d49b",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              label: "Person",
              description: "Attachment person",
              relationDefinition: {
                relationId: "1de5ca36-cb76-44c5-843d-df69540ae5b4",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  id: "4b31012b-6f6d-4c78-885f-448785d6d49b",
                  name: "person"
                },
                targetObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  id: "e509fba4-8f88-4534-995a-1b19076dcc14",
                  name: "attachments"
                }
              }
            },
            {
              id: "495a9120-681d-4f12-83db-78f5ea91f305",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "Attachment company id foreign key"
            },
            {
              id: "8e891853-b90a-4997-8e28-ff8a392936c5",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              label: "Company",
              description: "Attachment company",
              relationDefinition: {
                relationId: "abf7829a-191a-428f-b346-b30a3434b0d5",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  id: "8e891853-b90a-4997-8e28-ff8a392936c5",
                  name: "company"
                },
                targetObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  id: "965b0406-3f71-43bd-9f34-56d42ff2ba62",
                  name: "attachments"
                }
              }
            },
            {
              id: "bfdb4844-4372-4f37-b719-2cde862e351e",
              type: "UUID",
              name: "opportunityId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Opportunity id (foreign key)",
              description: "Attachment opportunity id foreign key"
            },
            {
              id: "47d2d7c6-1419-4678-9201-239b0a789ff6",
              type: "RELATION",
              name: "opportunity",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              label: "Opportunity",
              description: "Attachment opportunity",
              relationDefinition: {
                relationId: "38f3831f-6ac8-42eb-b5b9-a77a253064fd",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  id: "47d2d7c6-1419-4678-9201-239b0a789ff6",
                  name: "opportunity"
                },
                targetObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  id: "2ab93f6f-e87d-425b-9934-38760687bf0a",
                  name: "attachments"
                }
              }
            },
            {
              id: "c2a40ef8-3768-4980-8767-2557830a005e",
              type: "RELATION",
              name: "pet",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.268Z",
              updatedAt: "2025-02-07T10:58:03.268Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              label: "Pet",
              description: "Attachments Pet",
              relationDefinition: {
                relationId: "485366e6-2baf-4bcc-8af8-1c0284174016",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  id: "c2a40ef8-3768-4980-8767-2557830a005e",
                  name: "pet"
                },
                targetObjectMetadata: {
                  id: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                targetFieldMetadata: {
                  id: "1d685018-a4f1-4253-8cf3-334f18fbee78",
                  name: "attachments"
                }
              }
            },
            {
              id: "21c75a12-0f47-4799-882b-7a66d4d7d65c",
              type: "UUID",
              name: "petId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.268Z",
              updatedAt: "2025-02-07T10:58:03.268Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Pet ID (foreign key)",
              description: "Attachment Pet id foreign key"
            },
            {
              id: "958d0d9d-7199-492b-84a3-7cc2ff5fa35f",
              type: "RELATION",
              name: "surveyResult",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.974Z",
              updatedAt: "2025-02-07T10:58:03.974Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              label: "Survey result",
              description: "Attachments Survey result",
              relationDefinition: {
                relationId: "6369b332-29fd-426e-9b54-f66d68a1d516",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                sourceFieldMetadata: {
                  id: "958d0d9d-7199-492b-84a3-7cc2ff5fa35f",
                  name: "surveyResult"
                },
                targetObjectMetadata: {
                  id: "d830bda4-b6c0-4cfc-90fa-e9c237b95e2e",
                  nameSingular: "surveyResult",
                  namePlural: "surveyResults"
                },
                targetFieldMetadata: {
                  id: "9d0e4986-1c80-47c4-999a-2936ea95f8f0",
                  name: "attachments"
                }
              }
            },
            {
              id: "13d061fe-8660-460a-ade0-68e13d5fb5ab",
              type: "UUID",
              name: "surveyResultId",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.974Z",
              updatedAt: "2025-02-07T10:58:03.974Z",
              defaultValue: null,
              options: null,
              settings: {
                isForeignKey: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "64765f8e-17cc-4b11-a928-8a1298906f7f",
              relationDefinition: null,
              label: "Survey result ID (foreign key)",
              description: "Attachment Survey result id foreign key"
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "f9aed078-62f3-4051-aaef-7f74be8e4041",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_3ca1d5243ff67f58c7c65c9a8a2",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: []
                  }
                }
              },
              {
                node: {
                  id: "0f0cd62c-039d-4705-a514-de63d76759f2",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_73615a6bdc972b013956b19c59e",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "814393a7-17d5-486d-ac1d-73899e76f38d",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "bfdb4844-4372-4f37-b719-2cde862e351e"
                        }
                      },
                      {
                        node: {
                          id: "c4026897-8f4e-41e8-a866-39f04fc02585",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "2fc55329-0d00-43ec-9c52-cd94252db7f3"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "978b7ce8-aadc-4142-b712-bddec8510336",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_30f969e0ec549acca94396d3efe",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "f933c0c8-11e5-465b-9c44-8b2d2843cda7",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "2fc55329-0d00-43ec-9c52-cd94252db7f3"
                        }
                      },
                      {
                        node: {
                          id: "8d793db7-61b7-448b-931f-00c5d5f67b50",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "e5e36863-889b-48f2-a9e0-3ed253e03a5c"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "7e6ec9f3-f35d-4934-ace0-b97b906d263d",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_91e687ea21123af4e02c9a07a43",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "de1f1b3c-03f6-42c0-966d-8657eac91b0c",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "2fc55329-0d00-43ec-9c52-cd94252db7f3"
                        }
                      },
                      {
                        node: {
                          id: "ce0a49d7-3d6f-4eaa-903f-a66de967738b",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "495a9120-681d-4f12-83db-78f5ea91f305"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "adc3d2b7-3d93-4eb1-91e4-5fc9d8b66138",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_2055e4e583e9a2e5b4c239fd992",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "9fb598f9-ddf2-4a82-a0d2-1b5fbbf90fad",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "2fc55329-0d00-43ec-9c52-cd94252db7f3"
                        }
                      },
                      {
                        node: {
                          id: "e5cecac0-5e2b-4218-985f-8f32dfcecd37",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "5bc3bcc8-8b6e-4b15-a81c-3d54a9fbeea3"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "648f780c-49f2-417f-a137-bf5f092662fc",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_0698fed0e67005b7051b5d353b6",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: []
                  }
                }
              }
            ]
          }
        }
      },
      {
        node: {
          id: "611fe9aa-eba4-4b38-8392-84c6ff574f28",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "workflowEventListener",
          namePlural: "workflowEventListeners",
          icon: "IconSettingsAutomation",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "d83f653a-d826-45e4-aa6e-6c9c45cfbb28",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "WorkflowEventListener",
          labelPlural: "WorkflowEventListeners",
          description: "A workflow event listener",
          fieldsList: [
            {
              id: "d83f653a-d826-45e4-aa6e-6c9c45cfbb28",
              type: "TEXT",
              name: "eventName",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "611fe9aa-eba4-4b38-8392-84c6ff574f28",
              relationDefinition: null,
              label: "Name",
              description: "The workflow event listener name"
            },
            {
              id: "12557c3f-aaf2-4821-8ada-3bada2d23627",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "611fe9aa-eba4-4b38-8392-84c6ff574f28",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "dd626b5e-1328-47b7-a436-4e88d02e7a0a",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "611fe9aa-eba4-4b38-8392-84c6ff574f28",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "bd02c9c6-1ad4-4ffa-8944-eb999fe72526",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "611fe9aa-eba4-4b38-8392-84c6ff574f28",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "e9f9e99d-877a-4c39-a958-05f152b3d383",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "611fe9aa-eba4-4b38-8392-84c6ff574f28",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "06874697-3c48-46c7-8cf9-1ce36ccadda2",
              type: "UUID",
              name: "workflowId",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "611fe9aa-eba4-4b38-8392-84c6ff574f28",
              relationDefinition: null,
              label: "Workflow id (foreign key)",
              description: "WorkflowEventListener workflow id foreign key"
            },
            {
              id: "041b4423-6ecd-4f47-b121-a0ea642c56bd",
              type: "RELATION",
              name: "workflow",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "611fe9aa-eba4-4b38-8392-84c6ff574f28",
              label: "Workflow",
              description: "WorkflowEventListener workflow",
              relationDefinition: {
                relationId: "6b11bd33-80ae-4508-9a31-087a791cf3f2",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "611fe9aa-eba4-4b38-8392-84c6ff574f28",
                  nameSingular: "workflowEventListener",
                  namePlural: "workflowEventListeners"
                },
                sourceFieldMetadata: {
                  id: "041b4423-6ecd-4f47-b121-a0ea642c56bd",
                  name: "workflow"
                },
                targetObjectMetadata: {
                  id: "086e4ff9-7a55-4974-9756-710f2f46425c",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                targetFieldMetadata: {
                  id: "ba2c7278-1cd3-49ba-89b3-c9e7c032165f",
                  name: "eventListeners"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "20244efe-ab0a-4d76-bff0-4b95365f3dfe",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_9d6a1fb98ccde16ede8c5949d40",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "ddae1f04-e26a-4e23-8969-748c94e26903",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "e9f9e99d-877a-4c39-a958-05f152b3d383"
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
        node: {
          id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "person",
          namePlural: "people",
          icon: "IconUser",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "a4df62e7-5f61-4640-88ac-9ebdf0ea0754",
          imageIdentifierFieldMetadataId: "775efae6-bec9-43a1-b3f6-91c611936344",
          shortcut: "P",
          isLabelSyncedWithName: false,
          labelSingular: "Person",
          labelPlural: "People",
          description: "A person",
          fieldsList: [
            {
              id: "a4df62e7-5f61-4640-88ac-9ebdf0ea0754",
              type: "FULL_NAME",
              name: "name",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                lastName: "''",
                firstName: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Name",
              description: "Contact’s name"
            },
            {
              id: "f3081ffb-187c-4bed-b532-8e60c1a2fb2d",
              type: "EMAILS",
              name: "emails",
              icon: "IconMail",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: true,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                primaryEmail: "''",
                additionalEmails: null
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Emails",
              description: "Contact’s Emails"
            },
            {
              id: "24b31441-c0d1-4fc2-8f1b-e8334875daa8",
              type: "LINKS",
              name: "linkedinLink",
              icon: "IconBrandLinkedin",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Linkedin",
              description: "Contact’s Linkedin account"
            },
            {
              id: "2e1b47c2-1e21-4571-ae69-9ce905190338",
              type: "LINKS",
              name: "xLink",
              icon: "IconBrandX",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "X",
              description: "Contact’s X/Twitter account"
            },
            {
              id: "b5fc74e3-bf6d-48a7-bfa2-d1755bbbe798",
              type: "TEXT",
              name: "jobTitle",
              icon: "IconBriefcase",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Job Title",
              description: "Contact’s job title"
            },
            {
              id: "199579f4-ac5d-44d3-b94d-6708363f95c3",
              type: "PHONES",
              name: "phones",
              icon: "IconPhone",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                additionalPhones: null,
                primaryPhoneNumber: "''",
                primaryPhoneCallingCode: "''",
                primaryPhoneCountryCode: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Phones",
              description: "Contact’s phone numbers"
            },
            {
              id: "9c1a65b9-2715-41d9-afbc-edeb62714a73",
              type: "TEXT",
              name: "city",
              icon: "IconMap",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "City",
              description: "Contact’s city"
            },
            {
              id: "775efae6-bec9-43a1-b3f6-91c611936344",
              type: "TEXT",
              name: "avatarUrl",
              icon: "IconFileUpload",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Avatar",
              description: "Contact’s avatar"
            },
            {
              id: "7695cb62-650c-49a6-8066-41dcc1b5f5f3",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Position",
              description: "Person record Position"
            },
            {
              id: "5be4ed10-211e-4423-af2f-82d6ff8cc5ec",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              id: "5f110afd-0078-45fe-9269-92905c0cbd85",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              id: "98da5a69-4ad6-4974-91d9-8c77eb473474",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "7b241aaf-e1b9-4358-858f-1b3ee2fb5198",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "b4843efd-a849-49d9-8b10-887a50cb1291",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "63531988-4f0e-4815-a379-95af7da19217",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "28ef2a93-bf90-4660-92c1-e4fe58b95ba0",
              type: "UUID",
              name: "companyId",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Company id (foreign key)",
              description: "Contact’s company id foreign key"
            },
            {
              id: "a96c9aff-a04d-4d6b-8bc2-3fae89ffbf21",
              type: "RELATION",
              name: "company",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              label: "Company",
              description: "Contact’s company",
              relationDefinition: {
                relationId: "fa89bace-cced-4937-b2d7-b024e2e19f67",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  id: "a96c9aff-a04d-4d6b-8bc2-3fae89ffbf21",
                  name: "company"
                },
                targetObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                targetFieldMetadata: {
                  id: "67a01bab-2f01-4f82-a1e8-1eeb9663f048",
                  name: "people"
                }
              }
            },
            {
              id: "e27e1658-71fb-4920-ae58-dc7b6ddb4687",
              type: "RELATION",
              name: "pointOfContactForOpportunities",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              label: "Linked Opportunities",
              description: "List of opportunities for which that person is the point of contact",
              relationDefinition: {
                relationId: "8265433c-df28-4294-8d52-891206126568",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  id: "e27e1658-71fb-4920-ae58-dc7b6ddb4687",
                  name: "pointOfContactForOpportunities"
                },
                targetObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  id: "51f58992-fe8d-456d-b42c-a229ffacbf15",
                  name: "pointOfContact"
                }
              }
            },
            {
              id: "25040460-f26e-448b-b24d-7d4ef34ac604",
              type: "RELATION",
              name: "taskTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              label: "Tasks",
              description: "Tasks tied to the contact",
              relationDefinition: {
                relationId: "7bd08914-243c-4f03-9589-62d381c911f8",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  id: "25040460-f26e-448b-b24d-7d4ef34ac604",
                  name: "taskTargets"
                },
                targetObjectMetadata: {
                  id: "69a22300-9109-4eca-a926-1e26a86f674a",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                targetFieldMetadata: {
                  id: "9bf3a389-28f7-40ad-b239-b4f27c2944ea",
                  name: "person"
                }
              }
            },
            {
              id: "beb7f34c-dc86-4c0d-92a7-f978ffd64d7f",
              type: "RELATION",
              name: "noteTargets",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              label: "Notes",
              description: "Notes tied to the contact",
              relationDefinition: {
                relationId: "0a7abacf-b8e6-494c-9f50-a68b90febff5",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  id: "beb7f34c-dc86-4c0d-92a7-f978ffd64d7f",
                  name: "noteTargets"
                },
                targetObjectMetadata: {
                  id: "8f7f73af-32c4-4dcb-ba89-60829345d803",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                targetFieldMetadata: {
                  id: "ada0798d-702c-4beb-bdb8-3226de611145",
                  name: "person"
                }
              }
            },
            {
              id: "9ea7d6f6-9116-4694-bae7-43dc58785a11",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              label: "Favorites",
              description: "Favorites linked to the contact",
              relationDefinition: {
                relationId: "3cd19494-e9cf-4525-a44d-33d3c4fd8592",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  id: "9ea7d6f6-9116-4694-bae7-43dc58785a11",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  id: "a68bd1d1-41ca-401d-a7d4-7595a7ab92a0",
                  name: "person"
                }
              }
            },
            {
              id: "e509fba4-8f88-4534-995a-1b19076dcc14",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              label: "Attachments",
              description: "Attachments linked to the contact.",
              relationDefinition: {
                relationId: "1de5ca36-cb76-44c5-843d-df69540ae5b4",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  id: "e509fba4-8f88-4534-995a-1b19076dcc14",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  id: "4b31012b-6f6d-4c78-885f-448785d6d49b",
                  name: "person"
                }
              }
            },
            {
              id: "3a5177b3-431e-4667-9db7-c8d0539ae684",
              type: "RELATION",
              name: "messageParticipants",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              label: "Message Participants",
              description: "Message Participants",
              relationDefinition: {
                relationId: "9962d554-e63c-498f-8ea2-29a5debbed58",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  id: "3a5177b3-431e-4667-9db7-c8d0539ae684",
                  name: "messageParticipants"
                },
                targetObjectMetadata: {
                  id: "adc88048-b1a7-493b-b388-bc1edae1abdc",
                  nameSingular: "messageParticipant",
                  namePlural: "messageParticipants"
                },
                targetFieldMetadata: {
                  id: "b42e6657-7c2a-4c95-afa1-95182a341f8f",
                  name: "person"
                }
              }
            },
            {
              id: "955536ee-1483-485d-a057-53d669d71754",
              type: "RELATION",
              name: "calendarEventParticipants",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              label: "Calendar Event Participants",
              description: "Calendar Event Participants",
              relationDefinition: {
                relationId: "899f59b2-7f1e-4d25-be04-29cace991fc3",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  id: "955536ee-1483-485d-a057-53d669d71754",
                  name: "calendarEventParticipants"
                },
                targetObjectMetadata: {
                  id: "2470a60f-1133-4a14-8374-5f74eb244afe",
                  nameSingular: "calendarEventParticipant",
                  namePlural: "calendarEventParticipants"
                },
                targetFieldMetadata: {
                  id: "60dd98f8-cfc5-4bc9-bb80-4526c90f87d2",
                  name: "person"
                }
              }
            },
            {
              id: "ff392398-e031-426f-867f-6cbfbf5937c2",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              label: "Events",
              description: "Events linked to the person",
              relationDefinition: {
                relationId: "9017d7a8-2ae5-4dbe-8907-a663b980c2a2",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                sourceFieldMetadata: {
                  id: "ff392398-e031-426f-867f-6cbfbf5937c2",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  id: "d7ac6093-849f-4c92-87e9-93ec5c63e274",
                  name: "person"
                }
              }
            },
            {
              id: "7e204c2b-4c5a-4b12-92b8-83e1b50db014",
              type: "TEXT",
              name: "intro",
              icon: "IconNote",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:02.989Z",
              updatedAt: "2025-02-07T10:58:02.989Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Intro",
              description: "Contact's Intro"
            },
            {
              id: "34d15014-8a33-4bb6-aee1-fe0db0d3c789",
              type: "PHONES",
              name: "whatsapp",
              icon: "IconBrandWhatsapp",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:02.991Z",
              updatedAt: "2025-02-07T10:58:02.991Z",
              defaultValue: {
                additionalPhones: null,
                primaryPhoneNumber: "''",
                primaryPhoneCallingCode: "'+33'",
                primaryPhoneCountryCode: "'FR'"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Whatsapp",
              description: "Contact's Whatsapp Number"
            },
            {
              id: "2739a8a6-4f58-4d35-9657-d6bebe684229",
              type: "MULTI_SELECT",
              name: "workPreference",
              icon: "IconHome",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:02.994Z",
              updatedAt: "2025-02-07T10:58:02.994Z",
              defaultValue: null,
              options: [
                {
                  id: "86b5bc5d-7ffc-4b77-b22e-b68e5b7aaccb",
                  color: "green",
                  label: "On-Site",
                  value: "ON_SITE",
                  position: 0
                },
                {
                  id: "f7479fdb-eed6-4f4e-840d-5f12ce03cb79",
                  color: "turquoise",
                  label: "Hybrid",
                  value: "HYBRID",
                  position: 1
                },
                {
                  id: "2c40aa85-052b-4840-95a8-2179969480cc",
                  color: "sky",
                  label: "Remote Work",
                  value: "REMOTE_WORK",
                  position: 2
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Work Preference",
              description: "Person's Work Preference"
            },
            {
              id: "c0cff0f2-d9ee-463a-9413-beb8b22bfc0d",
              type: "RATING",
              name: "performanceRating",
              icon: "IconStars",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:02.996Z",
              updatedAt: "2025-02-07T10:58:02.996Z",
              defaultValue: null,
              options: [
                {
                  id: "1267e13c-856e-44d6-84ac-d6ab55e5b674",
                  label: "1",
                  value: "RATING_1",
                  position: 0
                },
                {
                  id: "cb9123a5-0040-4e87-9b00-cf4facbfaaa3",
                  label: "2",
                  value: "RATING_2",
                  position: 1
                },
                {
                  id: "54fd38f8-a48d-41b6-8ebc-dbe87f202c8e",
                  label: "3",
                  value: "RATING_3",
                  position: 2
                },
                {
                  id: "0aa56c6e-cf11-44af-a154-a39409322860",
                  label: "4",
                  value: "RATING_4",
                  position: 3
                },
                {
                  id: "cafbc52d-3733-4f99-aa3b-aaaf3e70122e",
                  label: "5",
                  value: "RATING_5",
                  position: 4
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
              relationDefinition: null,
              label: "Performance Rating",
              description: "Person's Performance Rating"
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "3fda992a-28b9-4874-9758-9d5e517c2d1f",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_bbd7aec1976fc684a0a5e4816c9",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "6d386a0a-067c-4232-9a56-9e0fa1d91869",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "5f110afd-0078-45fe-9269-92905c0cbd85"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "3886ec03-08b4-451b-b4c9-f22efcfdc075",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_6a862a788ac6ce967afa06df812",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "071a364b-9cf2-4740-bd20-2bbda6c02aa9",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "63531988-4f0e-4815-a379-95af7da19217"
                        }
                      },
                      {
                        node: {
                          id: "9ba01be3-0eed-44fd-8bfb-289f9cf1a941",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "28ef2a93-bf90-4660-92c1-e4fe58b95ba0"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "81be645e-c29e-4c27-ac9e-c944dbb810a7",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_UNIQUE_87914cd3ce963115f8cb943e2ac",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: true,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "69c8f25d-7f11-4f83-b172-4cde3ec0f756",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "f3081ffb-187c-4bed-b532-8e60c1a2fb2d"
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
        node: {
          id: "312b58cf-04ab-438a-9c11-c0a4a712b718",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "calendarChannelEventAssociation",
          namePlural: "calendarChannelEventAssociations",
          icon: "IconCalendar",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "bbd5b096-eb5f-4cd6-a2d4-2ecfd10bdd2f",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Calendar Channel Event Association",
          labelPlural: "Calendar Channel Event Associations",
          description: "Calendar Channel Event Associations",
          fieldsList: [
            {
              id: "6a71f2ef-f122-4844-b043-a66d8c0155f6",
              type: "TEXT",
              name: "eventExternalId",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "312b58cf-04ab-438a-9c11-c0a4a712b718",
              relationDefinition: null,
              label: "Event external ID",
              description: "Event external ID"
            },
            {
              id: "5500595c-95ba-4207-8a96-d6e43535f059",
              type: "TEXT",
              name: "recurringEventExternalId",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "312b58cf-04ab-438a-9c11-c0a4a712b718",
              relationDefinition: null,
              label: "Recurring Event ID",
              description: "Recurring Event ID"
            },
            {
              id: "bbd5b096-eb5f-4cd6-a2d4-2ecfd10bdd2f",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "312b58cf-04ab-438a-9c11-c0a4a712b718",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "09f73648-ae49-4870-8f5c-189165ca8331",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "312b58cf-04ab-438a-9c11-c0a4a712b718",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "d49da8c6-320d-4d52-b466-7c45b12cc782",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "312b58cf-04ab-438a-9c11-c0a4a712b718",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "5361c6c2-cdc5-44ee-bcfb-9271216828b6",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "312b58cf-04ab-438a-9c11-c0a4a712b718",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "69e9f16b-3a84-49f2-8704-9f808b3dc0f4",
              type: "UUID",
              name: "calendarChannelId",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "312b58cf-04ab-438a-9c11-c0a4a712b718",
              relationDefinition: null,
              label: "Channel ID id (foreign key)",
              description: "Channel ID id foreign key"
            },
            {
              id: "018bcb1b-05d4-4a61-aa95-958a65218a45",
              type: "RELATION",
              name: "calendarChannel",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "312b58cf-04ab-438a-9c11-c0a4a712b718",
              label: "Channel ID",
              description: "Channel ID",
              relationDefinition: {
                relationId: "c717b312-f236-4c3b-9591-7088b48a17b1",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "312b58cf-04ab-438a-9c11-c0a4a712b718",
                  nameSingular: "calendarChannelEventAssociation",
                  namePlural: "calendarChannelEventAssociations"
                },
                sourceFieldMetadata: {
                  id: "018bcb1b-05d4-4a61-aa95-958a65218a45",
                  name: "calendarChannel"
                },
                targetObjectMetadata: {
                  id: "045ab7da-15f7-4955-aa14-19e6f3d05658",
                  nameSingular: "calendarChannel",
                  namePlural: "calendarChannels"
                },
                targetFieldMetadata: {
                  id: "96c0191d-314f-4bcd-9d63-6c2f1b633f6c",
                  name: "calendarChannelEventAssociations"
                }
              }
            },
            {
              id: "a170ae23-dfc5-4325-b5e7-a82fa85f9adc",
              type: "UUID",
              name: "calendarEventId",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "312b58cf-04ab-438a-9c11-c0a4a712b718",
              relationDefinition: null,
              label: "Event ID id (foreign key)",
              description: "Event ID id foreign key"
            },
            {
              id: "e5405a2b-acdc-43da-b02a-ef1ade0bd7b4",
              type: "RELATION",
              name: "calendarEvent",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "312b58cf-04ab-438a-9c11-c0a4a712b718",
              label: "Event ID",
              description: "Event ID",
              relationDefinition: {
                relationId: "1023519e-34b5-4ce3-a085-b69c3da59ab5",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "312b58cf-04ab-438a-9c11-c0a4a712b718",
                  nameSingular: "calendarChannelEventAssociation",
                  namePlural: "calendarChannelEventAssociations"
                },
                sourceFieldMetadata: {
                  id: "e5405a2b-acdc-43da-b02a-ef1ade0bd7b4",
                  name: "calendarEvent"
                },
                targetObjectMetadata: {
                  id: "863af123-7089-424e-9bf9-face9412f4bb",
                  nameSingular: "calendarEvent",
                  namePlural: "calendarEvents"
                },
                targetFieldMetadata: {
                  id: "92249e83-d6a8-4d96-94b9-e31fe7c80151",
                  name: "calendarChannelEventAssociations"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "8f37c49a-073f-408c-9547-c5e9836fc575",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_92a888b681107c4f78926820db7",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "80e2e3ec-998b-4bec-b832-f9c8145c900d",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "5361c6c2-cdc5-44ee-bcfb-9271216828b6"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "4a8fefc0-b32c-4db6-bb22-622f74273426",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_a88c3ab301c25202d4b52fb4b1b",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "66bc10d8-6af7-4da1-942d-608cb9def49c",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "5361c6c2-cdc5-44ee-bcfb-9271216828b6"
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
        node: {
          id: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "auditLog",
          namePlural: "auditLogs",
          icon: "IconTimelineEvent",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "7a7a2a24-95c1-45fe-a360-403cae5d7545",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Audit Log",
          labelPlural: "Audit Logs",
          description: "An audit log of actions performed in the system",
          fieldsList: [
            {
              id: "7a7a2a24-95c1-45fe-a360-403cae5d7545",
              type: "TEXT",
              name: "name",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
              relationDefinition: null,
              label: "Event name",
              description: "Event name/type"
            },
            {
              id: "9c312052-a07a-4462-ac87-c16da35d92db",
              type: "RAW_JSON",
              name: "properties",
              icon: "IconListDetails",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
              relationDefinition: null,
              label: "Event details",
              description: "Json value for event details"
            },
            {
              id: "d583950e-0571-4c4a-9b85-226728ef5d3a",
              type: "RAW_JSON",
              name: "context",
              icon: "IconListDetails",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
              relationDefinition: null,
              label: "Event context",
              description: "Json object to provide context (user, device, workspace, etc.)"
            },
            {
              id: "3e12cfeb-77e3-448c-a5a5-d12ace89ac14",
              type: "TEXT",
              name: "objectName",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
              relationDefinition: null,
              label: "Object name",
              description: "Object name"
            },
            {
              id: "59a8a809-f4b2-4bbf-989c-3bc658fed50a",
              type: "TEXT",
              name: "objectMetadataId",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
              relationDefinition: null,
              label: "Object metadata id",
              description: "Object metadata id"
            },
            {
              id: "985ac4c7-6bed-4a6e-aa6e-0da1e76c793e",
              type: "UUID",
              name: "recordId",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
              relationDefinition: null,
              label: "Record id",
              description: "Record id"
            },
            {
              id: "6140b0ad-4ce2-4197-b9f8-865f146531e0",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "8af6828a-16fc-4bf5-95f9-10a520a55897",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "e698fc33-d190-4371-82b4-d2e1a05e19c1",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "1caa094a-69f7-4e0f-8215-61a6f80ff353",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "37c1c8fc-ecdf-44c1-a369-b2e7faf61f3a",
              type: "UUID",
              name: "workspaceMemberId",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
              relationDefinition: null,
              label: "Workspace Member id (foreign key)",
              description: "Event workspace member id foreign key"
            },
            {
              id: "f2c496a8-5477-4383-9546-9ec57826c8f0",
              type: "RELATION",
              name: "workspaceMember",
              icon: "IconCircleUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
              label: "Workspace Member",
              description: "Event workspace member",
              relationDefinition: {
                relationId: "b35ac2de-7118-402d-87d1-0c8f131156c6",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "2a092ff5-181f-4e54-ad23-77791bbf52b7",
                  nameSingular: "auditLog",
                  namePlural: "auditLogs"
                },
                sourceFieldMetadata: {
                  id: "f2c496a8-5477-4383-9546-9ec57826c8f0",
                  name: "workspaceMember"
                },
                targetObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  id: "bce52828-5582-4420-ae3e-6507bd45e83e",
                  name: "auditLogs"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "2085b672-e2e7-4c28-9291-fef40f4e12b5",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_ca389a7ad7595bb15d733535998",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "446e6261-0d06-4466-81ad-06710b1a0a6d",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "37c1c8fc-ecdf-44c1-a369-b2e7faf61f3a"
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
        node: {
          id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "company",
          namePlural: "companies",
          icon: "IconBuildingSkyscraper",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "f36c1621-2aef-4fe6-a302-d9645a41e387",
          imageIdentifierFieldMetadataId: null,
          shortcut: "C",
          isLabelSyncedWithName: false,
          labelSingular: "Company",
          labelPlural: "Companies",
          description: "A company",
          fieldsList: [
            {
              id: "f36c1621-2aef-4fe6-a302-d9645a41e387",
              type: "TEXT",
              name: "name",
              icon: "IconBuildingSkyscraper",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Name",
              description: "The company name"
            },
            {
              id: "230ea6bc-ebfe-4dcd-af20-4fa90c79e672",
              type: "LINKS",
              name: "domainName",
              icon: "IconLink",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: true,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Domain Name",
              description: "The company website URL. We use this url to fetch the company icon"
            },
            {
              id: "7252b194-0454-4a7c-9623-4222e1fefba2",
              type: "NUMBER",
              name: "employees",
              icon: "IconUsers",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Employees",
              description: "Number of employees in the company"
            },
            {
              id: "45528d61-3ead-4642-866d-038e07628838",
              type: "LINKS",
              name: "linkedinLink",
              icon: "IconBrandLinkedin",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Linkedin",
              description: "The company Linkedin account"
            },
            {
              id: "f69641a9-bac9-4d91-b166-7d5c9bf0cc98",
              type: "LINKS",
              name: "xLink",
              icon: "IconBrandX",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "X",
              description: "The company Twitter/X account"
            },
            {
              id: "c9031b0b-23af-456b-8dbb-aa7739663ad1",
              type: "CURRENCY",
              name: "annualRecurringRevenue",
              icon: "IconMoneybag",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                amountMicros: null,
                currencyCode: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "ARR",
              description: "Annual Recurring Revenue: The actual or estimated annual revenue of the company"
            },
            {
              id: "f789ea90-b349-4cfe-90fe-4a29357886fe",
              type: "ADDRESS",
              name: "address",
              icon: "IconMap",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
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
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Address",
              description: "Address of the company"
            },
            {
              id: "ccc10a00-8b42-4db0-97db-c2161b57d6b4",
              type: "BOOLEAN",
              name: "idealCustomerProfile",
              icon: "IconTarget",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: false,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "ICP",
              description: "Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you"
            },
            {
              id: "2e9eccb4-d4ec-42ea-a603-909f2738ea6f",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Position",
              description: "Company record position"
            },
            {
              id: "110078ef-b5ef-4fc6-974e-1aba4d59f8eb",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              id: "3bbad0e9-7ec5-48f0-82bb-981a147665f0",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              id: "93712981-3837-4109-a793-a7a47e9821e4",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "e9cdedef-6058-423b-a10b-facde812deb8",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "486d7157-f7ee-4d26-b238-98e7ac7ff225",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "19211d1b-7d77-4140-9a7b-9caeb0190d95",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "67a01bab-2f01-4f82-a1e8-1eeb9663f048",
              type: "RELATION",
              name: "people",
              icon: "IconUsers",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              label: "People",
              description: "People linked to the company.",
              relationDefinition: {
                relationId: "fa89bace-cced-4937-b2d7-b024e2e19f67",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  id: "67a01bab-2f01-4f82-a1e8-1eeb9663f048",
                  name: "people"
                },
                targetObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  id: "a96c9aff-a04d-4d6b-8bc2-3fae89ffbf21",
                  name: "company"
                }
              }
            },
            {
              id: "2917fe43-ceff-4c7d-9afe-f7a9bdcd25e4",
              type: "UUID",
              name: "accountOwnerId",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Account Owner id (foreign key)",
              description: "Your team member responsible for managing the company account id foreign key"
            },
            {
              id: "47fdf1f8-6b52-4502-bf5c-13b3cc2dae33",
              type: "RELATION",
              name: "accountOwner",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              label: "Account Owner",
              description: "Your team member responsible for managing the company account",
              relationDefinition: {
                relationId: "e74da4d0-fa0c-48d8-8948-999095f5205e",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  id: "47fdf1f8-6b52-4502-bf5c-13b3cc2dae33",
                  name: "accountOwner"
                },
                targetObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  id: "b7fa733d-3aa2-4dff-8f6a-7cc37a94bcdb",
                  name: "accountOwnerForCompanies"
                }
              }
            },
            {
              id: "efe4fff5-6405-460e-acea-664871aa875f",
              type: "RELATION",
              name: "taskTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              label: "Tasks",
              description: "Tasks tied to the company",
              relationDefinition: {
                relationId: "b967b8fe-7328-4b1a-8a0c-7c36a83c140d",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  id: "efe4fff5-6405-460e-acea-664871aa875f",
                  name: "taskTargets"
                },
                targetObjectMetadata: {
                  id: "69a22300-9109-4eca-a926-1e26a86f674a",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                targetFieldMetadata: {
                  id: "e876a8e4-1c94-483d-8240-c9c303a86ecc",
                  name: "company"
                }
              }
            },
            {
              id: "acee4d4a-7906-466e-b2f8-7437278db023",
              type: "RELATION",
              name: "noteTargets",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              label: "Notes",
              description: "Notes tied to the company",
              relationDefinition: {
                relationId: "ebaade58-c7e5-4dbd-9316-d83099b85ae4",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  id: "acee4d4a-7906-466e-b2f8-7437278db023",
                  name: "noteTargets"
                },
                targetObjectMetadata: {
                  id: "8f7f73af-32c4-4dcb-ba89-60829345d803",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                targetFieldMetadata: {
                  id: "f4cdc05f-b367-4e14-abec-041804a933b2",
                  name: "company"
                }
              }
            },
            {
              id: "d63badc4-81b3-4077-811c-8b6eebaf8104",
              type: "RELATION",
              name: "opportunities",
              icon: "IconTargetArrow",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              label: "Opportunities",
              description: "Opportunities linked to the company.",
              relationDefinition: {
                relationId: "248547d8-84ac-407b-9331-44510856a189",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  id: "d63badc4-81b3-4077-811c-8b6eebaf8104",
                  name: "opportunities"
                },
                targetObjectMetadata: {
                  id: "9e0462c6-48db-4894-9436-c6324f43444f",
                  nameSingular: "opportunity",
                  namePlural: "opportunities"
                },
                targetFieldMetadata: {
                  id: "5b0a215c-8d4d-4568-b900-179cee0bd0b8",
                  name: "company"
                }
              }
            },
            {
              id: "2b4da937-7a61-4bd6-83fa-ac025fbc8ff8",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              label: "Favorites",
              description: "Favorites linked to the company",
              relationDefinition: {
                relationId: "57830de4-fc66-4917-a7b0-1671a3e591d6",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  id: "2b4da937-7a61-4bd6-83fa-ac025fbc8ff8",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  id: "30e6bee7-8f94-4287-b3d4-966fda3caf59",
                  name: "company"
                }
              }
            },
            {
              id: "965b0406-3f71-43bd-9f34-56d42ff2ba62",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              label: "Attachments",
              description: "Attachments linked to the company",
              relationDefinition: {
                relationId: "abf7829a-191a-428f-b346-b30a3434b0d5",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  id: "965b0406-3f71-43bd-9f34-56d42ff2ba62",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  id: "8e891853-b90a-4997-8e28-ff8a392936c5",
                  name: "company"
                }
              }
            },
            {
              id: "4530929a-e628-4b9c-a6c9-20d62d325d50",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconIconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              label: "Timeline Activities",
              description: "Timeline Activities linked to the company",
              relationDefinition: {
                relationId: "11bf28ea-da71-400b-886f-af41500c8a2d",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
                  nameSingular: "company",
                  namePlural: "companies"
                },
                sourceFieldMetadata: {
                  id: "4530929a-e628-4b9c-a6c9-20d62d325d50",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  id: "5e6b1a44-04cb-41eb-a521-16896dc31741",
                  name: "company"
                }
              }
            },
            {
              id: "363f7112-6687-4c83-aa06-b7bffff5059b",
              type: "TEXT",
              name: "tagline",
              icon: "IconAdCircle",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:02.809Z",
              updatedAt: "2025-02-07T10:58:02.809Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Tagline",
              description: "Company's Tagline"
            },
            {
              id: "cb1e82d4-eb70-4612-a823-bbd673e6ae06",
              type: "LINKS",
              name: "introVideo",
              icon: "IconVideo",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:02.811Z",
              updatedAt: "2025-02-07T10:58:02.811Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Intro Video",
              description: "Company's Intro Video"
            },
            {
              id: "b87c68aa-041c-4a94-8ab6-119371c07cef",
              type: "MULTI_SELECT",
              name: "workPolicy",
              icon: "IconHome",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:02.813Z",
              updatedAt: "2025-02-07T10:58:02.813Z",
              defaultValue: null,
              options: [
                {
                  id: "a3a251d7-b3dd-4f24-acb7-518a628a6e63",
                  color: "green",
                  label: "On-Site",
                  value: "ON_SITE",
                  position: 0
                },
                {
                  id: "dfd223c5-0388-43d3-af87-ae75a3bbcf73",
                  color: "turquoise",
                  label: "Hybrid",
                  value: "HYBRID",
                  position: 1
                },
                {
                  id: "49dd65a4-f3a9-4cd5-a5c7-a3a0e0e3021e",
                  color: "sky",
                  label: "Remote Work",
                  value: "REMOTE_WORK",
                  position: 2
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Work Policy",
              description: "Company's Work Policy"
            },
            {
              id: "d3133e89-33f9-470f-b305-9be4f67a7dcc",
              type: "BOOLEAN",
              name: "visaSponsorship",
              icon: "IconBrandVisa",
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:02.816Z",
              updatedAt: "2025-02-07T10:58:02.816Z",
              defaultValue: false,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "273edb2d-6e48-4fe9-8e5d-b1fcac3ade56",
              relationDefinition: null,
              label: "Visa Sponsorship",
              description: "Company's Visa Sponsorship Policy"
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "df3857ee-6a5c-4877-907c-0456cc8d798c",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_UNIQUE_2a32339058d0b6910b0834ddf81",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: true,
                  indexFieldMetadatas: {
                    edges: []
                  }
                }
              },
              {
                node: {
                  id: "250f4eea-8a9a-44c7-95ad-22764fe96ed6",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_123501237187c835ede626367b7",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: []
                  }
                }
              },
              {
                node: {
                  id: "4d251e7a-ef90-404b-81cd-3fde0d01f7d8",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_fb1f4905546cfc6d70a971c76f7",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "43bfe250-4a62-4cd9-a6ed-360b9b25b388",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "3bbad0e9-7ec5-48f0-82bb-981a147665f0"
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
        node: {
          id: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "pet",
          namePlural: "pets",
          icon: "IconCat",
          isCustom: true,
          isRemote: false,
          isActive: true,
          isSystem: false,
          createdAt: "2025-02-07T10:58:03.255Z",
          updatedAt: "2025-02-07T10:58:03.260Z",
          labelIdentifierFieldMetadataId: "c0f7f904-d585-4759-8849-3262b3e81ffc",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Pet",
          labelPlural: "Pets",
          description: null,
          fieldsList: [
            {
              id: "509b030f-75c2-4b2f-93e2-bd66ac24d2a5",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.269Z",
              updatedAt: "2025-02-07T10:58:03.269Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              label: "Favorites",
              description: "Favorites tied to the Pet",
              relationDefinition: {
                relationId: "b03a7e39-6823-47b6-9e7b-81452c3156d2",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                sourceFieldMetadata: {
                  id: "509b030f-75c2-4b2f-93e2-bd66ac24d2a5",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  id: "1c5f2b2f-456a-4fd4-b749-fb873e9064a4",
                  name: "pet"
                }
              }
            },
            {
              id: "b3baedab-8273-4bf2-9cf6-b06fc7c3e70f",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: null,
              isCustom: false,
              isActive: false,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.281Z",
              updatedAt: "2025-02-07T10:58:03.281Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              id: "1d685018-a4f1-4253-8cf3-334f18fbee78",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.268Z",
              updatedAt: "2025-02-07T10:58:03.268Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              label: "Attachments",
              description: "Attachments tied to the Pet",
              relationDefinition: {
                relationId: "485366e6-2baf-4bcc-8af8-1c0284174016",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                sourceFieldMetadata: {
                  id: "1d685018-a4f1-4253-8cf3-334f18fbee78",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  id: "c2a40ef8-3768-4980-8767-2557830a005e",
                  name: "pet"
                }
              }
            },
            {
              id: "729dc846-c714-4f06-98c9-249d61e0ec48",
              type: "RELATION",
              name: "noteTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.271Z",
              updatedAt: "2025-02-07T10:58:03.271Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              label: "NoteTargets",
              description: "NoteTargets tied to the Pet",
              relationDefinition: {
                relationId: "5c0e8fa2-a2b7-4f5b-8c5a-aeceb96f1379",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                sourceFieldMetadata: {
                  id: "729dc846-c714-4f06-98c9-249d61e0ec48",
                  name: "noteTargets"
                },
                targetObjectMetadata: {
                  id: "8f7f73af-32c4-4dcb-ba89-60829345d803",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                targetFieldMetadata: {
                  id: "fc6b4de9-961e-4cdf-b644-05eb0fffec98",
                  name: "pet"
                }
              }
            },
            {
              id: "b4e38588-9364-437b-af77-1c0b8f039e80",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.255Z",
              updatedAt: "2025-02-07T10:58:03.255Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "c0f7f904-d585-4759-8849-3262b3e81ffc",
              type: "TEXT",
              name: "name",
              icon: "IconAbc",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.255Z",
              updatedAt: "2025-02-07T10:58:03.255Z",
              defaultValue: "'Untitled'",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Name",
              description: "Name"
            },
            {
              id: "19237a81-c216-4a67-b85f-9ba5ca45e13c",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.255Z",
              updatedAt: "2025-02-07T10:58:03.255Z",
              defaultValue: "now",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "efef65af-8626-4c09-b627-c60c773139f0",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.255Z",
              updatedAt: "2025-02-07T10:58:03.255Z",
              defaultValue: "now",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "28f01c12-d664-4c37-b0a6-f1f24001a42d",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.255Z",
              updatedAt: "2025-02-07T10:58:03.255Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Deleted at",
              description: "Deletion date"
            },
            {
              id: "9dd2ed1c-380a-46df-8295-1cd2d8d5c05d",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.255Z",
              updatedAt: "2025-02-07T10:58:03.255Z",
              defaultValue: {
                name: "''",
                source: "'MANUAL'"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              id: "0c56865f-9a71-4df6-846d-395a2e41e742",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.255Z",
              updatedAt: "2025-02-07T10:58:03.255Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Position",
              description: "Position"
            },
            {
              id: "c2c6804f-ec5d-47af-b1c3-9c34ccc65d31",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.270Z",
              updatedAt: "2025-02-07T10:58:03.270Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              label: "TimelineActivities",
              description: "TimelineActivities tied to the Pet",
              relationDefinition: {
                relationId: "05c73e13-8d6a-47e7-8ee1-3d8d7575a34f",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                sourceFieldMetadata: {
                  id: "c2c6804f-ec5d-47af-b1c3-9c34ccc65d31",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  id: "0504f5b6-08ee-43d1-849e-c63de4591a4e",
                  name: "pet"
                }
              }
            },
            {
              id: "f709ba2b-be94-474e-8b06-bc9974a5c7ef",
              type: "RELATION",
              name: "taskTargets",
              icon: "IconCheckbox",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.269Z",
              updatedAt: "2025-02-07T10:58:03.269Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              label: "TaskTargets",
              description: "TaskTargets tied to the Pet",
              relationDefinition: {
                relationId: "6482041c-c583-43d0-8da2-6209576491fd",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
                  nameSingular: "pet",
                  namePlural: "pets"
                },
                sourceFieldMetadata: {
                  id: "f709ba2b-be94-474e-8b06-bc9974a5c7ef",
                  name: "taskTargets"
                },
                targetObjectMetadata: {
                  id: "69a22300-9109-4eca-a926-1e26a86f674a",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                targetFieldMetadata: {
                  id: "757e8740-4843-4fad-bfb0-cc321d982fb1",
                  name: "pet"
                }
              }
            },
            {
              id: "79b36069-c8cf-4c59-a62c-acfbe8d8b337",
              type: "SELECT",
              name: "species",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.632Z",
              updatedAt: "2025-02-07T10:58:03.632Z",
              defaultValue: null,
              options: [
                {
                  id: "78fedc2b-0bf8-4c01-9e1e-61afd92ed730",
                  color: "blue",
                  label: "Dog",
                  value: "dog",
                  position: 0
                },
                {
                  id: "d5790480-98f3-4cdd-88a8-5cf78f91b09c",
                  color: "red",
                  label: "Cat",
                  value: "cat",
                  position: 1
                },
                {
                  id: "900e5681-48f9-4101-ac8d-38942c7d064a",
                  color: "green",
                  label: "Bird",
                  value: "bird",
                  position: 2
                },
                {
                  id: "2ddab29f-b404-4388-b3fb-ff50deb91d0e",
                  color: "yellow",
                  label: "Fish",
                  value: "fish",
                  position: 3
                },
                {
                  id: "f8fc514d-e62f-470b-8cfa-9cb83337aa20",
                  color: "purple",
                  label: "Rabbit",
                  value: "rabbit",
                  position: 4
                },
                {
                  id: "52cd8d34-7d68-4599-a856-078ca74681e9",
                  color: "orange",
                  label: "Hamster",
                  value: "hamster",
                  position: 5
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Species",
              description: ""
            },
            {
              id: "eebaba1e-5b23-4a65-ab35-a6cae1c345a8",
              type: "MULTI_SELECT",
              name: "traits",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.635Z",
              updatedAt: "2025-02-07T10:58:03.635Z",
              defaultValue: null,
              options: [
                {
                  id: "32323b9a-84a3-4455-b6ba-f476fa1b5826",
                  color: "blue",
                  label: "Playful",
                  value: "playful",
                  position: 0
                },
                {
                  id: "118ad11b-37ce-4b9b-9770-269bd838aea6",
                  color: "red",
                  label: "Friendly",
                  value: "friendly",
                  position: 1
                },
                {
                  id: "83ebc60a-853a-4240-b159-83d262a6051b",
                  color: "green",
                  label: "Protective",
                  value: "protective",
                  position: 2
                },
                {
                  id: "f3e710db-3836-484f-8b6e-72cd1c948513",
                  color: "yellow",
                  label: "Shy",
                  value: "shy",
                  position: 3
                },
                {
                  id: "14f0d57b-0892-4a13-b550-b6483539c6e2",
                  color: "purple",
                  label: "Brave",
                  value: "brave",
                  position: 4
                },
                {
                  id: "767d6f99-9777-4ddf-b40a-cd8d4090c7da",
                  color: "orange",
                  label: "Curious",
                  value: "curious",
                  position: 5
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Traits",
              description: ""
            },
            {
              id: "7b35f351-80f2-434d-a453-76e66f7a8b82",
              type: "TEXT",
              name: "comments",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.637Z",
              updatedAt: "2025-02-07T10:58:03.637Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Comments",
              description: ""
            },
            {
              id: "c9717853-5d11-41e2-8fba-0d19b2f27a7f",
              type: "NUMBER",
              name: "age",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.639Z",
              updatedAt: "2025-02-07T10:58:03.639Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Age",
              description: ""
            },
            {
              id: "e0ff0a65-5139-425a-b0fe-2563e2ba4d22",
              type: "ADDRESS",
              name: "location",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.641Z",
              updatedAt: "2025-02-07T10:58:03.641Z",
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
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Location",
              description: ""
            },
            {
              id: "e8afbb88-7800-4b2b-b264-f715c97e9a86",
              type: "PHONES",
              name: "vetPhone",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.643Z",
              updatedAt: "2025-02-07T10:58:03.643Z",
              defaultValue: {
                additionalPhones: null,
                primaryPhoneNumber: "''",
                primaryPhoneCallingCode: "''",
                primaryPhoneCountryCode: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Vet phone",
              description: ""
            },
            {
              id: "9e981d21-ac82-4330-99f2-8c928a463a2a",
              type: "EMAILS",
              name: "vetEmail",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.645Z",
              updatedAt: "2025-02-07T10:58:03.645Z",
              defaultValue: {
                primaryEmail: "''",
                additionalEmails: null
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Vet email",
              description: ""
            },
            {
              id: "452844ae-dbcb-4ea3-a4fd-88ce642f6941",
              type: "DATE",
              name: "birthday",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.647Z",
              updatedAt: "2025-02-07T10:58:03.647Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Birthday",
              description: ""
            },
            {
              id: "9cd7070c-52e4-4e4d-8e08-ddeed11fd0d9",
              type: "BOOLEAN",
              name: "isGoodWithKids",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.649Z",
              updatedAt: "2025-02-07T10:58:03.649Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Is good with kids",
              description: ""
            },
            {
              id: "925ae1b4-4ec8-4842-a877-b89cac608c3d",
              type: "LINKS",
              name: "pictures",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.651Z",
              updatedAt: "2025-02-07T10:58:03.651Z",
              defaultValue: {
                primaryLinkUrl: "''",
                secondaryLinks: "'[]'",
                primaryLinkLabel: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Pictures",
              description: ""
            },
            {
              id: "aa2bd136-d08e-4682-8961-2303d2d7b87d",
              type: "CURRENCY",
              name: "averageCostOfKibblePerMonth",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.653Z",
              updatedAt: "2025-02-07T10:58:03.653Z",
              defaultValue: {
                amountMicros: null,
                currencyCode: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Average cost of kibble per month",
              description: ""
            },
            {
              id: "956841a1-da00-4547-88d1-aff27dfdb7ab",
              type: "FULL_NAME",
              name: "makesOwnerThinkOf",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.655Z",
              updatedAt: "2025-02-07T10:58:03.655Z",
              defaultValue: {
                lastName: "''",
                firstName: "''"
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Makes its owner think of",
              description: ""
            },
            {
              id: "567b0a19-2b25-4de5-893f-830c82415ddf",
              type: "RATING",
              name: "soundSwag",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.657Z",
              updatedAt: "2025-02-07T10:58:03.657Z",
              defaultValue: null,
              options: [
                {
                  id: "fd2687fa-f738-4031-8e79-14f0392f4fc7",
                  label: "1",
                  value: "RATING_1",
                  position: 0
                },
                {
                  id: "8c1bee99-9e75-4982-a14e-9b08f98c939d",
                  label: "2",
                  value: "RATING_2",
                  position: 1
                },
                {
                  id: "88a933f8-2699-4dc7-8eff-8edfecb3bd55",
                  label: "3",
                  value: "RATING_3",
                  position: 2
                },
                {
                  id: "7ccd7e2a-1066-41ea-8462-d73e8878a66b",
                  label: "4",
                  value: "RATING_4",
                  position: 3
                },
                {
                  id: "cdfa5920-5d71-4740-9f84-e5bb04a2ac89",
                  label: "5",
                  value: "RATING_5",
                  position: 4
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Sound swag (bark style, meow style, etc.)",
              description: ""
            },
            {
              id: "59ce1ab5-3591-43db-85b4-418716c4a224",
              type: "RICH_TEXT",
              name: "bio",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.658Z",
              updatedAt: "2025-02-07T10:58:03.658Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Bio",
              description: ""
            },
            {
              id: "7ebf9c25-0469-4e37-b83e-5dad3224fcab",
              type: "ARRAY",
              name: "interestingFacts",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.660Z",
              updatedAt: "2025-02-07T10:58:03.660Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Interesting facts",
              description: ""
            },
            {
              id: "689d6ad5-ea0f-4a56-b6b4-a3747d3ee72f",
              type: "RAW_JSON",
              name: "extraData",
              icon: null,
              isCustom: true,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:58:03.662Z",
              updatedAt: "2025-02-07T10:58:03.662Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "267398cd-ec8d-4632-b7f2-8ba76a8e2c60",
              relationDefinition: null,
              label: "Extra data",
              description: ""
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "bac73163-1fd8-4585-9cd7-75b4ea0c6c45",
                  createdAt: "2025-02-07T10:58:03.287Z",
                  updatedAt: "2025-02-07T10:58:03.287Z",
                  name: "IDX_82c02a6c94da4f260020dfb54b9",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: []
                  }
                }
              }
            ]
          }
        }
      },
      {
        node: {
          id: "24c7b746-68be-40da-8189-8b7ace3d09c8",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "task",
          namePlural: "tasks",
          icon: "IconCheckbox",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "6cff9056-c204-4afa-b971-790db5bafff7",
          imageIdentifierFieldMetadataId: null,
          shortcut: "T",
          isLabelSyncedWithName: false,
          labelSingular: "Task",
          labelPlural: "Tasks",
          description: "A task",
          fieldsList: [
            {
              id: "a543fe20-e198-4b93-81de-cdbd510d3a6a",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              relationDefinition: null,
              label: "Position",
              description: "Task record position"
            },
            {
              id: "6cff9056-c204-4afa-b971-790db5bafff7",
              type: "TEXT",
              name: "title",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              relationDefinition: null,
              label: "Title",
              description: "Task title"
            },
            {
              id: "54206d66-3b21-492b-982d-b86f6e95244c",
              type: "RICH_TEXT",
              name: "body",
              icon: "IconFilePencil",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              relationDefinition: null,
              label: "Body",
              description: "Task body"
            },
            {
              id: "44ff41e9-ab5d-4f41-b16e-7b9d6e1cbbb1",
              type: "DATE_TIME",
              name: "dueAt",
              icon: "IconCalendarEvent",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              relationDefinition: null,
              label: "Due Date",
              description: "Task due date"
            },
            {
              id: "a5d9462f-7f54-4255-82d5-12b2ac418238",
              type: "SELECT",
              name: "status",
              icon: "IconCheck",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'TODO'",
              options: [
                {
                  id: "cc541498-2861-40bf-a260-ab9e8a329d01",
                  color: "sky",
                  label: "To do",
                  value: "TODO",
                  position: 0
                },
                {
                  id: "63ed0b68-6624-4711-b1e3-0b23af010412",
                  color: "purple",
                  label: "In progress",
                  value: "IN_PROGRESS",
                  position: 1
                },
                {
                  id: "ad2d94b1-2eef-49a6-997f-da458b08c92e",
                  color: "green",
                  label: "Done",
                  value: "DONE",
                  position: 1
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              relationDefinition: null,
              label: "Status",
              description: "Task status"
            },
            {
              id: "966604c1-23ae-4059-8f45-60ecae0775d2",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              id: "42bf65e1-5006-48f6-8f3c-fa2c808b1326",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              id: "d9258470-67de-4cac-95ff-aa440a1be8a8",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "7fafeccb-c961-4a0d-aaeb-7001ad2d917b",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "6b282219-e4a0-4ac0-bb59-4e7cf5f4e868",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "5a54ffa3-07e8-436e-a934-117dc191d71d",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "ad40f3e4-cb44-46b5-893f-46e049c841b5",
              type: "RELATION",
              name: "taskTargets",
              icon: "IconArrowUpRight",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              label: "Relations",
              description: "Task targets",
              relationDefinition: {
                relationId: "59f93745-3b1a-4e28-ba15-cd758bfd9bc9",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "24c7b746-68be-40da-8189-8b7ace3d09c8",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                sourceFieldMetadata: {
                  id: "ad40f3e4-cb44-46b5-893f-46e049c841b5",
                  name: "taskTargets"
                },
                targetObjectMetadata: {
                  id: "69a22300-9109-4eca-a926-1e26a86f674a",
                  nameSingular: "taskTarget",
                  namePlural: "taskTargets"
                },
                targetFieldMetadata: {
                  id: "f6afd1ec-916d-4d82-b363-f0e828af2d60",
                  name: "task"
                }
              }
            },
            {
              id: "9ab851fd-dd90-4153-92a0-da9a9b689dd9",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              label: "Attachments",
              description: "Task attachments",
              relationDefinition: {
                relationId: "1cee091d-865a-4e83-9d8c-04e043b49e08",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "24c7b746-68be-40da-8189-8b7ace3d09c8",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                sourceFieldMetadata: {
                  id: "9ab851fd-dd90-4153-92a0-da9a9b689dd9",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  id: "e0b48fe7-6be3-4813-b3fe-22f43ffb37b7",
                  name: "task"
                }
              }
            },
            {
              id: "60b0b920-ae08-4a09-b254-d0397038bf7e",
              type: "UUID",
              name: "assigneeId",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              relationDefinition: null,
              label: "Assignee id (foreign key)",
              description: "Task assignee id foreign key"
            },
            {
              id: "998ee4c8-90ab-4bb2-a538-3446e4a8a401",
              type: "RELATION",
              name: "assignee",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              label: "Assignee",
              description: "Task assignee",
              relationDefinition: {
                relationId: "ec1cc09a-8b22-465d-9d4e-f8e527cfb42b",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "24c7b746-68be-40da-8189-8b7ace3d09c8",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                sourceFieldMetadata: {
                  id: "998ee4c8-90ab-4bb2-a538-3446e4a8a401",
                  name: "assignee"
                },
                targetObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  id: "54514b1e-7e8f-4cb5-b6ea-729a9ebc9121",
                  name: "assignedTasks"
                }
              }
            },
            {
              id: "30e49cbc-8c2e-4c39-be1a-5af522a8e71d",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              label: "Timeline Activities",
              description: "Timeline Activities linked to the task.",
              relationDefinition: {
                relationId: "9b455a41-1050-4906-823c-93a0330b7289",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "24c7b746-68be-40da-8189-8b7ace3d09c8",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                sourceFieldMetadata: {
                  id: "30e49cbc-8c2e-4c39-be1a-5af522a8e71d",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  id: "adfea4d4-656c-428e-b003-c17725ec718c",
                  name: "task"
                }
              }
            },
            {
              id: "d9ae12c1-f284-4e72-b27a-9f199b28253b",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "24c7b746-68be-40da-8189-8b7ace3d09c8",
              label: "Favorites",
              description: "Favorites linked to the task",
              relationDefinition: {
                relationId: "658ac5b6-c1a8-49b3-a6f9-71c237650a58",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "24c7b746-68be-40da-8189-8b7ace3d09c8",
                  nameSingular: "task",
                  namePlural: "tasks"
                },
                sourceFieldMetadata: {
                  id: "d9ae12c1-f284-4e72-b27a-9f199b28253b",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  id: "4a7a62ee-1202-41f0-8466-78729ed6d199",
                  name: "task"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "bea6f1eb-fd01-4190-8170-7384ae50d3ae",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_d01a000cf26e1225d894dc3d364",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "54403587-9948-4c41-b7e8-5388f4a8193d",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "42bf65e1-5006-48f6-8f3c-fa2c808b1326"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "8133753a-c723-4a1f-9582-a0422a4cc7d7",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_ee5298b25512b38b29390e084f7",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "d78815ce-29c7-4471-92d3-1525ef4c1cd0",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "5a54ffa3-07e8-436e-a934-117dc191d71d"
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
        node: {
          id: "2470a60f-1133-4a14-8374-5f74eb244afe",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "calendarEventParticipant",
          namePlural: "calendarEventParticipants",
          icon: "IconCalendar",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "af9e5915-0273-4c96-9269-2b00e4e7456a",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Calendar event participant",
          labelPlural: "Calendar event participants",
          description: "Calendar event participants",
          fieldsList: [
            {
              id: "22d2d692-35c3-4da8-8c63-7c77fb3fe3dc",
              type: "UUID",
              name: "calendarEventId",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              relationDefinition: null,
              label: "Event ID id (foreign key)",
              description: "Event ID id foreign key"
            },
            {
              id: "48a7df41-5153-4814-a151-b50c6180928a",
              type: "RELATION",
              name: "calendarEvent",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              label: "Event ID",
              description: "Event ID",
              relationDefinition: {
                relationId: "091de895-59b1-4855-bfd5-666a666164d8",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "2470a60f-1133-4a14-8374-5f74eb244afe",
                  nameSingular: "calendarEventParticipant",
                  namePlural: "calendarEventParticipants"
                },
                sourceFieldMetadata: {
                  id: "48a7df41-5153-4814-a151-b50c6180928a",
                  name: "calendarEvent"
                },
                targetObjectMetadata: {
                  id: "863af123-7089-424e-9bf9-face9412f4bb",
                  nameSingular: "calendarEvent",
                  namePlural: "calendarEvents"
                },
                targetFieldMetadata: {
                  id: "e3dff08a-c697-48b3-a5ae-24f2dd1e1b5d",
                  name: "calendarEventParticipants"
                }
              }
            },
            {
              id: "af9e5915-0273-4c96-9269-2b00e4e7456a",
              type: "TEXT",
              name: "handle",
              icon: "IconMail",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              relationDefinition: null,
              label: "Handle",
              description: "Handle"
            },
            {
              id: "f43f571d-9653-43bb-bd4a-e33a22ebc363",
              type: "TEXT",
              name: "displayName",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              relationDefinition: null,
              label: "Display Name",
              description: "Display Name"
            },
            {
              id: "753f56fc-293e-4f95-b2a6-5f0949388697",
              type: "BOOLEAN",
              name: "isOrganizer",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: false,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              relationDefinition: null,
              label: "Is Organizer",
              description: "Is Organizer"
            },
            {
              id: "d643f443-658d-4172-b6dd-b598bce91543",
              type: "SELECT",
              name: "responseStatus",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'NEEDS_ACTION'",
              options: [
                {
                  id: "d7a9e5da-0bc4-4c2f-8a96-869829fa6a2b",
                  color: "orange",
                  label: "Needs Action",
                  value: "NEEDS_ACTION",
                  position: 0
                },
                {
                  id: "45d7c413-f493-4196-afb4-32b0f1c4c46d",
                  color: "red",
                  label: "Declined",
                  value: "DECLINED",
                  position: 1
                },
                {
                  id: "fae62430-6092-4280-90f4-8eddc6992967",
                  color: "yellow",
                  label: "Tentative",
                  value: "TENTATIVE",
                  position: 2
                },
                {
                  id: "dbbcb6e1-d270-49bc-b217-76e971467d69",
                  color: "green",
                  label: "Accepted",
                  value: "ACCEPTED",
                  position: 3
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              relationDefinition: null,
              label: "Response Status",
              description: "Response Status"
            },
            {
              id: "7423937f-86f3-4f20-b660-62391345136c",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "a57c11d8-8089-4ebe-94b3-244959c67e23",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "177703f9-d0c0-4251-841e-9c548285029d",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "e51e1b2f-2651-4e92-af59-58cb9c511d0e",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "f85144f5-1a41-4999-827f-1f3534486767",
              type: "UUID",
              name: "personId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              relationDefinition: null,
              label: "Person id (foreign key)",
              description: "Person id foreign key"
            },
            {
              id: "60dd98f8-cfc5-4bc9-bb80-4526c90f87d2",
              type: "RELATION",
              name: "person",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              label: "Person",
              description: "Person",
              relationDefinition: {
                relationId: "899f59b2-7f1e-4d25-be04-29cace991fc3",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "2470a60f-1133-4a14-8374-5f74eb244afe",
                  nameSingular: "calendarEventParticipant",
                  namePlural: "calendarEventParticipants"
                },
                sourceFieldMetadata: {
                  id: "60dd98f8-cfc5-4bc9-bb80-4526c90f87d2",
                  name: "person"
                },
                targetObjectMetadata: {
                  id: "48a9d97e-29ba-4f39-a597-9fa91b62865b",
                  nameSingular: "person",
                  namePlural: "people"
                },
                targetFieldMetadata: {
                  id: "955536ee-1483-485d-a057-53d669d71754",
                  name: "calendarEventParticipants"
                }
              }
            },
            {
              id: "4b38e29a-d46b-4274-8628-f5ed173ce298",
              type: "UUID",
              name: "workspaceMemberId",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              relationDefinition: null,
              label: "Workspace Member id (foreign key)",
              description: "Workspace Member id foreign key"
            },
            {
              id: "b69dfdf5-a7e4-4fe3-b396-a59db0f0c87a",
              type: "RELATION",
              name: "workspaceMember",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "2470a60f-1133-4a14-8374-5f74eb244afe",
              label: "Workspace Member",
              description: "Workspace Member",
              relationDefinition: {
                relationId: "0e605026-5673-4cb1-aa6f-ed76ecda3fa5",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "2470a60f-1133-4a14-8374-5f74eb244afe",
                  nameSingular: "calendarEventParticipant",
                  namePlural: "calendarEventParticipants"
                },
                sourceFieldMetadata: {
                  id: "b69dfdf5-a7e4-4fe3-b396-a59db0f0c87a",
                  name: "workspaceMember"
                },
                targetObjectMetadata: {
                  id: "d944d2e1-c536-44dc-93a2-c715a5a57e90",
                  nameSingular: "workspaceMember",
                  namePlural: "workspaceMembers"
                },
                targetFieldMetadata: {
                  id: "42e60c24-3eea-4edf-b1cf-495597d9e025",
                  name: "calendarEventParticipants"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "7f0f5d0d-5e61-4ddd-b841-2e3c1807b2cb",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_0da422bbe7adbabb8144c696ebd",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: []
                  }
                }
              },
              {
                node: {
                  id: "ee8ed933-af53-4147-a703-c174e4bde7b7",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_2bf094726f6d91639302c1c143d",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "4bc4ae0d-75d7-47b6-8f4c-2bc48b8749ad",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "e51e1b2f-2651-4e92-af59-58cb9c511d0e"
                        }
                      },
                      {
                        node: {
                          id: "73b40024-14ef-46cf-b1ea-e79e1f91b474",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "4b38e29a-d46b-4274-8628-f5ed173ce298"
                        }
                      }
                    ]
                  }
                }
              },
              {
                node: {
                  id: "9670cb2c-1689-4fe9-83b0-ddcb92d1129e",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_dd22aee9059fd7002165df6d8cc",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "bb64be1b-02f5-4b31-bdb6-4102ee1a4530",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "e51e1b2f-2651-4e92-af59-58cb9c511d0e"
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
        node: {
          id: "15e17021-5b35-434f-b246-edcb51d583a6",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "message",
          namePlural: "messages",
          icon: "IconMessage",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "2de78222-f7e7-466d-a948-bcf105ff7434",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Message",
          labelPlural: "Messages",
          description: "A message sent or received through a messaging channel (email, chat, etc.)",
          fieldsList: [
            {
              id: "b8e2dd8e-a0ad-4685-bdba-1ac584a82ac9",
              type: "TEXT",
              name: "headerMessageId",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "15e17021-5b35-434f-b246-edcb51d583a6",
              relationDefinition: null,
              label: "Header message Id",
              description: "Message id from the message header"
            },
            {
              id: "2de78222-f7e7-466d-a948-bcf105ff7434",
              type: "TEXT",
              name: "subject",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "15e17021-5b35-434f-b246-edcb51d583a6",
              relationDefinition: null,
              label: "Subject",
              description: "Subject"
            },
            {
              id: "0b2d0a20-a970-48e3-8239-192ac12a55e1",
              type: "TEXT",
              name: "text",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "15e17021-5b35-434f-b246-edcb51d583a6",
              relationDefinition: null,
              label: "Text",
              description: "Text"
            },
            {
              id: "78504693-95a2-48df-b104-15f701575ecf",
              type: "DATE_TIME",
              name: "receivedAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "15e17021-5b35-434f-b246-edcb51d583a6",
              relationDefinition: null,
              label: "Received At",
              description: "The date the message was received"
            },
            {
              id: "2253adaf-552f-4e37-8d46-8ca6e5895bf2",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "15e17021-5b35-434f-b246-edcb51d583a6",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "6d839108-49d0-4db6-9973-be428f74d70c",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "15e17021-5b35-434f-b246-edcb51d583a6",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "e3ac3926-e432-471a-beec-07f008f4d6ca",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "15e17021-5b35-434f-b246-edcb51d583a6",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "98c52d2d-198e-4cbc-8095-b1283d29f695",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "15e17021-5b35-434f-b246-edcb51d583a6",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "76c259ac-a3c7-4fba-a012-53f40891df1e",
              type: "UUID",
              name: "messageThreadId",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "15e17021-5b35-434f-b246-edcb51d583a6",
              relationDefinition: null,
              label: "Message Thread Id id (foreign key)",
              description: "Message Thread Id id foreign key"
            },
            {
              id: "66fa3f43-dba8-4e05-b019-737e2b601333",
              type: "RELATION",
              name: "messageThread",
              icon: "IconHash",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "15e17021-5b35-434f-b246-edcb51d583a6",
              label: "Message Thread Id",
              description: "Message Thread Id",
              relationDefinition: {
                relationId: "0ac501bc-cf38-4b8d-a6be-2240aca8d002",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "15e17021-5b35-434f-b246-edcb51d583a6",
                  nameSingular: "message",
                  namePlural: "messages"
                },
                sourceFieldMetadata: {
                  id: "66fa3f43-dba8-4e05-b019-737e2b601333",
                  name: "messageThread"
                },
                targetObjectMetadata: {
                  id: "74a86d25-7bee-4b08-b23b-fbbb8a66001d",
                  nameSingular: "messageThread",
                  namePlural: "messageThreads"
                },
                targetFieldMetadata: {
                  id: "e336b591-f67a-4f17-8622-c8d3a69b47b9",
                  name: "messages"
                }
              }
            },
            {
              id: "6dbe41d2-ba69-47a5-a4e0-297264a61ac7",
              type: "RELATION",
              name: "messageParticipants",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "15e17021-5b35-434f-b246-edcb51d583a6",
              label: "Message Participants",
              description: "Message Participants",
              relationDefinition: {
                relationId: "24489acb-39fd-45f4-8ccd-19b5e77c97b1",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "15e17021-5b35-434f-b246-edcb51d583a6",
                  nameSingular: "message",
                  namePlural: "messages"
                },
                sourceFieldMetadata: {
                  id: "6dbe41d2-ba69-47a5-a4e0-297264a61ac7",
                  name: "messageParticipants"
                },
                targetObjectMetadata: {
                  id: "adc88048-b1a7-493b-b388-bc1edae1abdc",
                  nameSingular: "messageParticipant",
                  namePlural: "messageParticipants"
                },
                targetFieldMetadata: {
                  id: "93063aec-efc9-4187-bffb-c126ab4def1e",
                  name: "message"
                }
              }
            },
            {
              id: "6bb31032-b051-49f9-a144-98f6a2cae938",
              type: "RELATION",
              name: "messageChannelMessageAssociations",
              icon: "IconMessage",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "15e17021-5b35-434f-b246-edcb51d583a6",
              label: "Message Channel Association",
              description: "Messages from the channel.",
              relationDefinition: {
                relationId: "2061715e-5818-46f3-b15e-c6664d97637f",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "15e17021-5b35-434f-b246-edcb51d583a6",
                  nameSingular: "message",
                  namePlural: "messages"
                },
                sourceFieldMetadata: {
                  id: "6bb31032-b051-49f9-a144-98f6a2cae938",
                  name: "messageChannelMessageAssociations"
                },
                targetObjectMetadata: {
                  id: "a6216b79-a7fc-4cb8-aa20-ffc247714595",
                  nameSingular: "messageChannelMessageAssociation",
                  namePlural: "messageChannelMessageAssociations"
                },
                targetFieldMetadata: {
                  id: "2905cdde-d263-4c7c-8db4-e9da1fdf2925",
                  name: "message"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "30d5c293-1f23-4218-bb55-efcdd2e0bd78",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_78fa73d661d632619e17de211e6",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "d58006d7-6131-4560-82d8-478ece672414",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "98c52d2d-198e-4cbc-8095-b1283d29f695"
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
        node: {
          id: "11404ff2-0997-45dc-8efd-6ba08c12e150",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "note",
          namePlural: "notes",
          icon: "IconNotes",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "a24f2ea4-99dc-4500-94ee-473190f8309c",
          imageIdentifierFieldMetadataId: null,
          shortcut: "N",
          isLabelSyncedWithName: false,
          labelSingular: "Note",
          labelPlural: "Notes",
          description: "A note",
          fieldsList: [
            {
              id: "ca02bd90-efde-4b28-930c-46b2962bb87b",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "11404ff2-0997-45dc-8efd-6ba08c12e150",
              relationDefinition: null,
              label: "Position",
              description: "Note record position"
            },
            {
              id: "a24f2ea4-99dc-4500-94ee-473190f8309c",
              type: "TEXT",
              name: "title",
              icon: "IconNotes",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "11404ff2-0997-45dc-8efd-6ba08c12e150",
              relationDefinition: null,
              label: "Title",
              description: "Note title"
            },
            {
              id: "4be02780-713c-4dab-928d-c2366e615cdf",
              type: "RICH_TEXT",
              name: "body",
              icon: "IconFilePencil",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "11404ff2-0997-45dc-8efd-6ba08c12e150",
              relationDefinition: null,
              label: "Body",
              description: "Note body"
            },
            {
              id: "030ad9cf-0e8a-4472-85fb-925235d676ec",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "11404ff2-0997-45dc-8efd-6ba08c12e150",
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              id: "24677232-13f9-454c-9041-020c027071cf",
              type: "TS_VECTOR",
              name: "searchVector",
              icon: "IconUser",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "11404ff2-0997-45dc-8efd-6ba08c12e150",
              relationDefinition: null,
              label: "Search vector",
              description: "Field used for full-text search"
            },
            {
              id: "a636687d-a666-4f5a-8511-00bda427a6af",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "11404ff2-0997-45dc-8efd-6ba08c12e150",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "81a39437-75b7-45c4-9c60-2a8a37e30577",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "11404ff2-0997-45dc-8efd-6ba08c12e150",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "f36744d8-b9f5-4697-b8b2-52a82d4c8a80",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "11404ff2-0997-45dc-8efd-6ba08c12e150",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "dfb2a35a-2d89-413f-a0b8-81b0f9137a71",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "11404ff2-0997-45dc-8efd-6ba08c12e150",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "4d03c705-2f4c-49e1-9f9c-74da9925f72c",
              type: "RELATION",
              name: "noteTargets",
              icon: "IconArrowUpRight",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "11404ff2-0997-45dc-8efd-6ba08c12e150",
              label: "Relations",
              description: "Note targets",
              relationDefinition: {
                relationId: "c35e7b84-25b8-4d13-96ab-cefcaf29a6f6",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "11404ff2-0997-45dc-8efd-6ba08c12e150",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                sourceFieldMetadata: {
                  id: "4d03c705-2f4c-49e1-9f9c-74da9925f72c",
                  name: "noteTargets"
                },
                targetObjectMetadata: {
                  id: "8f7f73af-32c4-4dcb-ba89-60829345d803",
                  nameSingular: "noteTarget",
                  namePlural: "noteTargets"
                },
                targetFieldMetadata: {
                  id: "af41c4d0-2f48-4259-8de4-1d63abc3b92d",
                  name: "note"
                }
              }
            },
            {
              id: "a8b515aa-d9e2-4178-a862-d7aed28c100e",
              type: "RELATION",
              name: "attachments",
              icon: "IconFileImport",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "11404ff2-0997-45dc-8efd-6ba08c12e150",
              label: "Attachments",
              description: "Note attachments",
              relationDefinition: {
                relationId: "842a844a-90a1-4835-9268-4a586ac3f073",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "11404ff2-0997-45dc-8efd-6ba08c12e150",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                sourceFieldMetadata: {
                  id: "a8b515aa-d9e2-4178-a862-d7aed28c100e",
                  name: "attachments"
                },
                targetObjectMetadata: {
                  id: "64765f8e-17cc-4b11-a928-8a1298906f7f",
                  nameSingular: "attachment",
                  namePlural: "attachments"
                },
                targetFieldMetadata: {
                  id: "a323d73b-ef09-4017-9c67-3210ea9771bf",
                  name: "note"
                }
              }
            },
            {
              id: "98343f95-7245-44b5-92ff-18b8a11384f4",
              type: "RELATION",
              name: "timelineActivities",
              icon: "IconTimelineEvent",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "11404ff2-0997-45dc-8efd-6ba08c12e150",
              label: "Timeline Activities",
              description: "Timeline Activities linked to the note.",
              relationDefinition: {
                relationId: "99efb0ac-4af8-47a6-a28a-e1b66aa06b62",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "11404ff2-0997-45dc-8efd-6ba08c12e150",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                sourceFieldMetadata: {
                  id: "98343f95-7245-44b5-92ff-18b8a11384f4",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  id: "f26b4e6e-5bba-420b-8f02-735e191bcf96",
                  name: "note"
                }
              }
            },
            {
              id: "84e4cd96-9eed-47ce-884c-1244e55f3c5a",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "11404ff2-0997-45dc-8efd-6ba08c12e150",
              label: "Favorites",
              description: "Favorites linked to the note",
              relationDefinition: {
                relationId: "dcdb01b8-5b34-48f5-92e7-bac40a882d78",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "11404ff2-0997-45dc-8efd-6ba08c12e150",
                  nameSingular: "note",
                  namePlural: "notes"
                },
                sourceFieldMetadata: {
                  id: "84e4cd96-9eed-47ce-884c-1244e55f3c5a",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  id: "260743f3-8b46-4259-997a-b26c65409be4",
                  name: "note"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "0ad0aea6-1a07-48cc-8b80-749cbcebb1ba",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_f20de8d7fc74a405e4083051275",
                  indexWhereClause: null,
                  indexType: "GIN",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "8e55b0c8-e312-48d2-9795-c1f154b76b56",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "24677232-13f9-454c-9041-020c027071cf"
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
        node: {
          id: "086e4ff9-7a55-4974-9756-710f2f46425c",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "workflow",
          namePlural: "workflows",
          icon: "IconSettingsAutomation",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "fd480629-3895-4caf-ba46-e6cb3ccd894f",
          imageIdentifierFieldMetadataId: null,
          shortcut: "W",
          isLabelSyncedWithName: false,
          labelSingular: "Workflow",
          labelPlural: "Workflows",
          description: "A workflow",
          fieldsList: [
            {
              id: "fd480629-3895-4caf-ba46-e6cb3ccd894f",
              type: "TEXT",
              name: "name",
              icon: "IconSettingsAutomation",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              relationDefinition: null,
              label: "Name",
              description: "The workflow name"
            },
            {
              id: "21b1b679-f46b-473c-9259-d26782ef8f04",
              type: "TEXT",
              name: "lastPublishedVersionId",
              icon: "IconVersions",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              relationDefinition: null,
              label: "Last published Version Id",
              description: "The workflow last published version id"
            },
            {
              id: "a4eeec83-6d46-4fff-9d13-e18ab73fbf3c",
              type: "MULTI_SELECT",
              name: "statuses",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
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
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              relationDefinition: null,
              label: "Statuses",
              description: "The current statuses of the workflow versions"
            },
            {
              id: "5fdfb500-d8e2-419f-b92b-fbbf73c475ea",
              type: "POSITION",
              name: "position",
              icon: "IconHierarchy2",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              relationDefinition: null,
              label: "Position",
              description: "Workflow record position"
            },
            {
              id: "4a87086b-2479-4079-9bb9-f3679f14a98d",
              type: "ACTOR",
              name: "createdBy",
              icon: "IconCreativeCommonsSa",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: {
                name: "'System'",
                source: "'MANUAL'",
                context: {}
              },
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              relationDefinition: null,
              label: "Created by",
              description: "The creator of the record"
            },
            {
              id: "416adc2e-7271-443b-b7bc-c6b5c34b7f1e",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "9cb929c0-3943-4a1c-b94f-a3105e98b1a3",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "1cb007f9-65b5-4a19-8142-bc8f60c992e5",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "ef24928f-0bb0-46ab-9470-8953136fc8b8",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "727e02c9-5ffd-4d97-b4de-82c4eff3f535",
              type: "RELATION",
              name: "versions",
              icon: "IconVersions",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              label: "Versions",
              description: "Workflow versions linked to the workflow.",
              relationDefinition: {
                relationId: "3ef2e5a3-c76b-446e-b486-19c53fcaaa37",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "086e4ff9-7a55-4974-9756-710f2f46425c",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                sourceFieldMetadata: {
                  id: "727e02c9-5ffd-4d97-b4de-82c4eff3f535",
                  name: "versions"
                },
                targetObjectMetadata: {
                  id: "b7f98b5a-8c12-4fd8-845c-32fab12919d8",
                  nameSingular: "workflowVersion",
                  namePlural: "workflowVersions"
                },
                targetFieldMetadata: {
                  id: "8faadf15-6e7d-4b58-b06c-4c3ed34eb78f",
                  name: "workflow"
                }
              }
            },
            {
              id: "93ae910b-8ae8-4ee3-853a-c2ede901942e",
              type: "RELATION",
              name: "runs",
              icon: "IconRun",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              label: "Runs",
              description: "Workflow runs linked to the workflow.",
              relationDefinition: {
                relationId: "39d7527e-0669-4cbd-b0f5-342929f08d15",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "086e4ff9-7a55-4974-9756-710f2f46425c",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                sourceFieldMetadata: {
                  id: "93ae910b-8ae8-4ee3-853a-c2ede901942e",
                  name: "runs"
                },
                targetObjectMetadata: {
                  id: "c722cbde-6aaf-4128-aa90-bb142b40408e",
                  nameSingular: "workflowRun",
                  namePlural: "workflowRuns"
                },
                targetFieldMetadata: {
                  id: "e69f8a7e-90fc-42e0-a007-a97c615c62d0",
                  name: "workflow"
                }
              }
            },
            {
              id: "ba2c7278-1cd3-49ba-89b3-c9e7c032165f",
              type: "RELATION",
              name: "eventListeners",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              label: "Event Listeners",
              description: "Workflow event listeners linked to the workflow.",
              relationDefinition: {
                relationId: "6b11bd33-80ae-4508-9a31-087a791cf3f2",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "086e4ff9-7a55-4974-9756-710f2f46425c",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                sourceFieldMetadata: {
                  id: "ba2c7278-1cd3-49ba-89b3-c9e7c032165f",
                  name: "eventListeners"
                },
                targetObjectMetadata: {
                  id: "611fe9aa-eba4-4b38-8392-84c6ff574f28",
                  nameSingular: "workflowEventListener",
                  namePlural: "workflowEventListeners"
                },
                targetFieldMetadata: {
                  id: "041b4423-6ecd-4f47-b121-a0ea642c56bd",
                  name: "workflow"
                }
              }
            },
            {
              id: "c63b223f-3adf-44c2-96c0-4a70b08f0b29",
              type: "RELATION",
              name: "favorites",
              icon: "IconHeart",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              label: "Favorites",
              description: "Favorites linked to the workflow",
              relationDefinition: {
                relationId: "def517f1-7564-4d48-979b-04128ddc40cb",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "086e4ff9-7a55-4974-9756-710f2f46425c",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                sourceFieldMetadata: {
                  id: "c63b223f-3adf-44c2-96c0-4a70b08f0b29",
                  name: "favorites"
                },
                targetObjectMetadata: {
                  id: "c0e56e33-af43-46f3-96f4-1a29a7bcfdac",
                  nameSingular: "favorite",
                  namePlural: "favorites"
                },
                targetFieldMetadata: {
                  id: "ef99269a-a63d-41f2-9aa7-a462f552f931",
                  name: "workflow"
                }
              }
            },
            {
              id: "fe54e4c9-aa25-40ae-9890-fec0807c07a5",
              type: "RELATION",
              name: "timelineActivities",
              icon: null,
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "086e4ff9-7a55-4974-9756-710f2f46425c",
              label: "Timeline Activities",
              description: "Timeline activities linked to the workflow",
              relationDefinition: {
                relationId: "f7bf5cdb-5fc6-4a2d-9b2b-f67c0173c0a8",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "086e4ff9-7a55-4974-9756-710f2f46425c",
                  nameSingular: "workflow",
                  namePlural: "workflows"
                },
                sourceFieldMetadata: {
                  id: "fe54e4c9-aa25-40ae-9890-fec0807c07a5",
                  name: "timelineActivities"
                },
                targetObjectMetadata: {
                  id: "f3767a39-5ce3-4e1c-b442-3a41df66114f",
                  nameSingular: "timelineActivity",
                  namePlural: "timelineActivities"
                },
                targetFieldMetadata: {
                  id: "df92ef09-8e90-4385-aefd-4c1b4980aaf6",
                  name: "workflow"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: []
          }
        }
      },
      {
        node: {
          id: "045ab7da-15f7-4955-aa14-19e6f3d05658",
          dataSourceId: "ee1ec522-bb12-4d95-8eb4-0f35d900de4e",
          nameSingular: "calendarChannel",
          namePlural: "calendarChannels",
          icon: "IconCalendar",
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: true,
          createdAt: "2025-02-07T10:57:57.439Z",
          updatedAt: "2025-02-07T10:57:57.439Z",
          labelIdentifierFieldMetadataId: "a0fd215a-1273-4fca-9829-471e876a016c",
          imageIdentifierFieldMetadataId: null,
          shortcut: null,
          isLabelSyncedWithName: false,
          labelSingular: "Calendar Channel",
          labelPlural: "Calendar Channels",
          description: "Calendar Channels",
          fieldsList: [
            {
              id: "a0fd215a-1273-4fca-9829-471e876a016c",
              type: "TEXT",
              name: "handle",
              icon: "IconAt",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Handle",
              description: "Handle"
            },
            {
              id: "70fce690-383d-4bb4-b86b-1453434052a1",
              type: "SELECT",
              name: "syncStatus",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: [
                {
                  id: "41036aaa-a2a5-4c1b-a4a1-65808069198d",
                  color: "yellow",
                  label: "Ongoing",
                  value: "ONGOING",
                  position: 1
                },
                {
                  id: "07561cf8-1718-4560-8fd2-5abba5bfd369",
                  color: "blue",
                  label: "Not Synced",
                  value: "NOT_SYNCED",
                  position: 2
                },
                {
                  id: "7ae19586-c014-454a-839c-91efb12b8e56",
                  color: "green",
                  label: "Active",
                  value: "ACTIVE",
                  position: 3
                },
                {
                  id: "a67b5406-b5d5-4e16-b7c0-d30ac1007eeb",
                  color: "red",
                  label: "Failed Insufficient Permissions",
                  value: "FAILED_INSUFFICIENT_PERMISSIONS",
                  position: 4
                },
                {
                  id: "b71dde13-a5c8-4e08-8de9-92e9cf454b0e",
                  color: "red",
                  label: "Failed Unknown",
                  value: "FAILED_UNKNOWN",
                  position: 5
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Sync status",
              description: "Sync status"
            },
            {
              id: "28ac99dd-99d2-4861-8486-dceaeb8f89d3",
              type: "SELECT",
              name: "syncStage",
              icon: "IconStatusChange",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING'",
              options: [
                {
                  id: "d7de75af-3a33-42b6-ae44-14469abf9034",
                  color: "blue",
                  label: "Full calendar event list fetch pending",
                  value: "FULL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                  position: 0
                },
                {
                  id: "3931f67b-7667-477d-8a50-2769c1e0fc73",
                  color: "blue",
                  label: "Partial calendar event list fetch pending",
                  value: "PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                  position: 1
                },
                {
                  id: "75f8ed71-809c-45f4-8dd6-1ee885883e73",
                  color: "orange",
                  label: "Calendar event list fetch ongoing",
                  value: "CALENDAR_EVENT_LIST_FETCH_ONGOING",
                  position: 2
                },
                {
                  id: "d512e5cf-37a4-4b73-828b-e9496b831cf9",
                  color: "blue",
                  label: "Calendar events import pending",
                  value: "CALENDAR_EVENTS_IMPORT_PENDING",
                  position: 3
                },
                {
                  id: "8469737d-ae7c-4c8b-a1c3-5f71b03a2ccc",
                  color: "orange",
                  label: "Calendar events import ongoing",
                  value: "CALENDAR_EVENTS_IMPORT_ONGOING",
                  position: 4
                },
                {
                  id: "d44fe5f0-a4c6-4fad-b076-5eb479538973",
                  color: "red",
                  label: "Failed",
                  value: "FAILED",
                  position: 5
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Sync stage",
              description: "Sync stage"
            },
            {
              id: "c409a117-09f1-4b78-89c5-7315b640b13c",
              type: "SELECT",
              name: "visibility",
              icon: "IconEyeglass",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'SHARE_EVERYTHING'",
              options: [
                {
                  id: "d512a3d5-d5b2-46fb-bb4a-4b89af3a2985",
                  color: "green",
                  label: "Metadata",
                  value: "METADATA",
                  position: 0
                },
                {
                  id: "df69f934-96c7-4f7f-80c1-72ffe96e9341",
                  color: "orange",
                  label: "Share Everything",
                  value: "SHARE_EVERYTHING",
                  position: 1
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Visibility",
              description: "Visibility"
            },
            {
              id: "d2b8facd-5a8b-4054-9c77-e080c6044d78",
              type: "BOOLEAN",
              name: "isContactAutoCreationEnabled",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Is Contact Auto Creation Enabled",
              description: "Is Contact Auto Creation Enabled"
            },
            {
              id: "bb1fbb65-261d-4aad-b810-7e9f90af5b65",
              type: "SELECT",
              name: "contactAutoCreationPolicy",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "'AS_PARTICIPANT_AND_ORGANIZER'",
              options: [
                {
                  id: "655db8e3-cdff-4c9b-b55e-129010ace74c",
                  color: "green",
                  label: "As Participant and Organizer",
                  value: "AS_PARTICIPANT_AND_ORGANIZER",
                  position: 0
                },
                {
                  id: "04f75dc0-d411-4a47-8777-624b512ec917",
                  color: "orange",
                  label: "As Participant",
                  value: "AS_PARTICIPANT",
                  position: 1
                },
                {
                  id: "62556094-e91f-4907-9901-bcbc95800fd0",
                  color: "blue",
                  label: "As Organizer",
                  value: "AS_ORGANIZER",
                  position: 2
                },
                {
                  id: "8c26952a-df0a-473e-a999-9d9047d28c4d",
                  color: "red",
                  label: "None",
                  value: "NONE",
                  position: 3
                }
              ],
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Contact auto creation policy",
              description: "Automatically create records for people you participated with in an event."
            },
            {
              id: "f4776c54-2229-4b83-bf5e-a68fb29499ff",
              type: "BOOLEAN",
              name: "isSyncEnabled",
              icon: "IconRefresh",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: true,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Is Sync Enabled",
              description: "Is Sync Enabled"
            },
            {
              id: "c336a1b9-2feb-4041-a0b7-f511c152776a",
              type: "TEXT",
              name: "syncCursor",
              icon: "IconReload",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "''",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Sync Cursor",
              description: "Sync Cursor. Used for syncing events from the calendar provider"
            },
            {
              id: "bc776868-db26-4541-bd96-ebf8e0aa5493",
              type: "DATE_TIME",
              name: "syncedAt",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Last sync date",
              description: "Last sync date"
            },
            {
              id: "ef8e1fc8-d94c-4442-ac80-92ef07114b46",
              type: "DATE_TIME",
              name: "syncStageStartedAt",
              icon: "IconHistory",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Sync stage started at",
              description: "Sync stage started at"
            },
            {
              id: "1b939c1d-5d29-460e-8c0d-0d3ae323e3f6",
              type: "NUMBER",
              name: "throttleFailureCount",
              icon: "IconX",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: 0,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Throttle Failure Count",
              description: "Throttle Failure Count"
            },
            {
              id: "469b76a1-7254-4ee6-a2f0-284632303f01",
              type: "UUID",
              name: "id",
              icon: "Icon123",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "uuid",
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Id",
              description: "Id"
            },
            {
              id: "78e5e79c-c7f6-4492-974b-90ed6b943dc9",
              type: "DATE_TIME",
              name: "createdAt",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Creation date",
              description: "Creation date"
            },
            {
              id: "3f42a081-2cae-47d6-bc6f-5a4f1990b5e0",
              type: "DATE_TIME",
              name: "updatedAt",
              icon: "IconCalendarClock",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: "now",
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Last update",
              description: "Last time the record was changed"
            },
            {
              id: "19f6f436-a056-421d-99c0-a4c41f9bd162",
              type: "DATE_TIME",
              name: "deletedAt",
              icon: "IconCalendarMinus",
              isCustom: false,
              isActive: true,
              isSystem: false,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: {
                displayAsRelativeDate: true
              },
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Deleted at",
              description: "Date when the record was deleted"
            },
            {
              id: "85151a40-bc89-4e34-96f8-de69f22a0767",
              type: "UUID",
              name: "connectedAccountId",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: false,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              relationDefinition: null,
              label: "Connected Account id (foreign key)",
              description: "Connected Account id foreign key"
            },
            {
              id: "5fd6c818-0ae4-4da2-b749-a2ef37ed6435",
              type: "RELATION",
              name: "connectedAccount",
              icon: "IconUserCircle",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              label: "Connected Account",
              description: "Connected Account",
              relationDefinition: {
                relationId: "7318bfe8-0ca4-41c1-86d6-25af816e69e5",
                direction: "MANY_TO_ONE",
                sourceObjectMetadata: {
                  id: "045ab7da-15f7-4955-aa14-19e6f3d05658",
                  nameSingular: "calendarChannel",
                  namePlural: "calendarChannels"
                },
                sourceFieldMetadata: {
                  id: "5fd6c818-0ae4-4da2-b749-a2ef37ed6435",
                  name: "connectedAccount"
                },
                targetObjectMetadata: {
                  id: "a7e82b00-5c6c-4194-8f13-a48b43705a41",
                  nameSingular: "connectedAccount",
                  namePlural: "connectedAccounts"
                },
                targetFieldMetadata: {
                  id: "38676f2a-6626-464d-a635-62b18306149c",
                  name: "calendarChannels"
                }
              }
            },
            {
              id: "96c0191d-314f-4bcd-9d63-6c2f1b633f6c",
              type: "RELATION",
              name: "calendarChannelEventAssociations",
              icon: "IconCalendar",
              isCustom: false,
              isActive: true,
              isSystem: true,
              isNullable: true,
              isUnique: false,
              createdAt: "2025-02-07T10:57:57.439Z",
              updatedAt: "2025-02-07T10:57:57.439Z",
              defaultValue: null,
              options: null,
              settings: null,
              isLabelSyncedWithName: false,
              objectMetadataId: "045ab7da-15f7-4955-aa14-19e6f3d05658",
              label: "Calendar Channel Event Associations",
              description: "Calendar Channel Event Associations",
              relationDefinition: {
                relationId: "c717b312-f236-4c3b-9591-7088b48a17b1",
                direction: "ONE_TO_MANY",
                sourceObjectMetadata: {
                  id: "045ab7da-15f7-4955-aa14-19e6f3d05658",
                  nameSingular: "calendarChannel",
                  namePlural: "calendarChannels"
                },
                sourceFieldMetadata: {
                  id: "96c0191d-314f-4bcd-9d63-6c2f1b633f6c",
                  name: "calendarChannelEventAssociations"
                },
                targetObjectMetadata: {
                  id: "312b58cf-04ab-438a-9c11-c0a4a712b718",
                  nameSingular: "calendarChannelEventAssociation",
                  namePlural: "calendarChannelEventAssociations"
                },
                targetFieldMetadata: {
                  id: "018bcb1b-05d4-4a61-aa95-958a65218a45",
                  name: "calendarChannel"
                }
              }
            }
          ],
          indexMetadatas: {
            edges: [
              {
                node: {
                  id: "ea7d13f7-ffb4-4faa-a9c5-677467dcc011",
                  createdAt: "2025-02-07T10:57:57.439Z",
                  updatedAt: "2025-02-07T10:57:57.439Z",
                  name: "IDX_3465c79448bacd2f1268e5f6310",
                  indexWhereClause: null,
                  indexType: "BTREE",
                  isUnique: false,
                  indexFieldMetadatas: {
                    edges: [
                      {
                        node: {
                          id: "51a495bf-b741-41f8-b9d1-2cf50db3f4d2",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 0,
                          fieldMetadataId: "85151a40-bc89-4e34-96f8-de69f22a0767"
                        }
                      },
                      {
                        node: {
                          id: "dd11e8cd-cf1b-4633-8f8f-4d714f3112b5",
                          createdAt: "2025-02-07T10:57:57.439Z",
                          updatedAt: "2025-02-07T10:57:57.439Z",
                          order: 1,
                          fieldMetadataId: "19f6f436-a056-421d-99c0-a4c41f9bd162"
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
