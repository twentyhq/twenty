import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';

import {
  ATTACHMENT_STANDARD_FIELD_IDS,
  BLOCKLIST_STANDARD_FIELD_IDS,
  CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS,
  CALENDAR_CHANNEL_STANDARD_FIELD_IDS,
  CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS,
  CALENDAR_EVENT_STANDARD_FIELD_IDS,
  COMPANY_STANDARD_FIELD_IDS,
  CONNECTED_ACCOUNT_STANDARD_FIELD_IDS,
  DASHBOARD_STANDARD_FIELD_IDS,
  FAVORITE_FOLDER_STANDARD_FIELD_IDS,
  FAVORITE_STANDARD_FIELD_IDS,
  MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS,
  MESSAGE_CHANNEL_STANDARD_FIELD_IDS,
  MESSAGE_FOLDER_STANDARD_FIELD_IDS,
  MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS,
  MESSAGE_STANDARD_FIELD_IDS,
  MESSAGE_THREAD_STANDARD_FIELD_IDS,
  NOTE_STANDARD_FIELD_IDS,
  NOTE_TARGET_STANDARD_FIELD_IDS,
  OPPORTUNITY_STANDARD_FIELD_IDS,
  PERSON_STANDARD_FIELD_IDS,
  TASK_STANDARD_FIELD_IDS,
  TASK_TARGET_STANDARD_FIELD_IDS,
  TIMELINE_ACTIVITY_STANDARD_FIELD_IDS,
  VIEW_FIELD_STANDARD_FIELD_IDS,
  VIEW_FILTER_GROUP_STANDARD_FIELD_IDS,
  VIEW_FILTER_STANDARD_FIELD_IDS,
  VIEW_GROUP_STANDARD_FIELD_IDS,
  VIEW_SORT_STANDARD_FIELD_IDS,
  VIEW_STANDARD_FIELD_IDS,
  WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS,
  WORKFLOW_RUN_STANDARD_FIELD_IDS,
  WORKFLOW_STANDARD_FIELD_IDS,
  WORKFLOW_VERSION_STANDARD_FIELD_IDS,
  WORKSPACE_MEMBER_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const STANDARD_OBJECTS = {
  attachment: {
    universalIdentifier: STANDARD_OBJECT_IDS.attachment,
    fields: {
      id: { universalIdentifier: '20202020-a01a-4001-8a01-1d5f8e3c7b2a' },
      createdAt: {
        universalIdentifier: '20202020-a01b-4002-9b02-2e6f9f4d8c3b',
      },
      updatedAt: {
        universalIdentifier: '20202020-a01c-4003-8c03-3f7fa05d9d4c',
      },
      deletedAt: {
        universalIdentifier: '20202020-a01d-4004-9d04-4f8fb16eae5d',
      },
      name: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.name },
      fullPath: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.fullPath },
      type: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.type },
      fileCategory: {
        universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.fileCategory,
      },
      createdBy: {
        universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.createdBy,
      },
      author: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.author },
      activity: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.activity },
      task: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.task },
      note: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.note },
      person: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.person },
      company: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.company },
      opportunity: {
        universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.opportunity,
      },
      dashboard: {
        universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.dashboard,
      },
      workflow: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.workflow },
      custom: { universalIdentifier: ATTACHMENT_STANDARD_FIELD_IDS.custom },
    },
    views: {},
  },
  blocklist: {
    universalIdentifier: STANDARD_OBJECT_IDS.blocklist,
    fields: {
      id: { universalIdentifier: '20202020-b01a-4011-8b11-5a9fc27fbf6e' },
      createdAt: {
        universalIdentifier: '20202020-b01b-4012-9c12-6bafd38fcf7f',
      },
      updatedAt: {
        universalIdentifier: '20202020-b01c-4013-8d13-7cbfe49fdf8f',
      },
      deletedAt: {
        universalIdentifier: '20202020-b01d-4014-9e14-8dcff5affef9',
      },
      handle: { universalIdentifier: BLOCKLIST_STANDARD_FIELD_IDS.handle },
      workspaceMember: {
        universalIdentifier: BLOCKLIST_STANDARD_FIELD_IDS.workspaceMember,
      },
    },
    views: {},
  },
  calendarChannelEventAssociation: {
    universalIdentifier: STANDARD_OBJECT_IDS.calendarChannelEventAssociation,
    fields: {
      id: {
        universalIdentifier: '20202020-c01a-4021-8a21-9edf06bfef0a',
      },
      createdAt: {
        universalIdentifier: '20202020-c01b-4022-9b22-afefd7cffefb',
      },
      updatedAt: {
        universalIdentifier: '20202020-c01c-4023-8c23-bffef8dffef0',
      },
      deletedAt: {
        universalIdentifier: '20202020-c01d-4024-9d24-cffef9effef1',
      },
      calendarChannel: {
        universalIdentifier:
          CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.calendarChannel,
      },
      calendarEvent: {
        universalIdentifier:
          CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.calendarEvent,
      },
      eventExternalId: {
        universalIdentifier:
          CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.eventExternalId,
      },
      recurringEventExternalId: {
        universalIdentifier:
          CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.recurringEventExternalId,
      },
    },
    views: {},
  },
  calendarChannel: {
    universalIdentifier: STANDARD_OBJECT_IDS.calendarChannel,
    fields: {
      id: { universalIdentifier: '20202020-c02a-4031-8a31-1a2f3b4c5d6e' },
      createdAt: {
        universalIdentifier: '20202020-c02b-4032-9b32-2b3f4c5d6e7f',
      },
      updatedAt: {
        universalIdentifier: '20202020-c02c-4033-8c33-3c4f5d6e7f8a',
      },
      deletedAt: {
        universalIdentifier: '20202020-c02d-4034-9d34-4d5f6e7f8a9b',
      },
      connectedAccount: {
        universalIdentifier:
          CALENDAR_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
      },
      handle: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.handle,
      },
      visibility: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.visibility,
      },
      isContactAutoCreationEnabled: {
        universalIdentifier:
          CALENDAR_CHANNEL_STANDARD_FIELD_IDS.isContactAutoCreationEnabled,
      },
      contactAutoCreationPolicy: {
        universalIdentifier:
          CALENDAR_CHANNEL_STANDARD_FIELD_IDS.contactAutoCreationPolicy,
      },
      isSyncEnabled: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.isSyncEnabled,
      },
      syncCursor: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncCursor,
      },
      calendarChannelEventAssociations: {
        universalIdentifier:
          CALENDAR_CHANNEL_STANDARD_FIELD_IDS.calendarChannelEventAssociations,
      },
      throttleFailureCount: {
        universalIdentifier:
          CALENDAR_CHANNEL_STANDARD_FIELD_IDS.throttleFailureCount,
      },
      syncStatus: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
      },
      syncStage: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStage,
      },
      syncStageStartedAt: {
        universalIdentifier:
          CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncStageStartedAt,
      },
      syncedAt: {
        universalIdentifier: CALENDAR_CHANNEL_STANDARD_FIELD_IDS.syncedAt,
      },
    },
    views: {},
  },
  calendarEventParticipant: {
    universalIdentifier: STANDARD_OBJECT_IDS.calendarEventParticipant,
    fields: {
      id: {
        universalIdentifier: '20202020-c03a-4041-8a41-5e6f7a8b9cad',
      },
      createdAt: {
        universalIdentifier: '20202020-c03b-4042-9b42-6f7a8b9cadbe',
      },
      updatedAt: {
        universalIdentifier: '20202020-c03c-4043-8c43-7a8b9cadbecf',
      },
      deletedAt: {
        universalIdentifier: '20202020-c03d-4044-9d44-8b9cadbecd0f',
      },
      calendarEvent: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.calendarEvent,
      },
      handle: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.handle,
      },
      displayName: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.displayName,
      },
      isOrganizer: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.isOrganizer,
      },
      responseStatus: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.responseStatus,
      },
      person: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.person,
      },
      workspaceMember: {
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS.workspaceMember,
      },
    },
    views: {},
  },
  calendarEvent: {
    universalIdentifier: STANDARD_OBJECT_IDS.calendarEvent,
    fields: {
      id: { universalIdentifier: '20202020-c04a-4051-8a51-9cadbe0f1e2d' },
      createdAt: {
        universalIdentifier: '20202020-c04b-4052-9b52-adbecf1f2e3e',
      },
      updatedAt: {
        universalIdentifier: '20202020-c04c-4053-8c53-becf0f2f3e4f',
      },
      deletedAt: {
        universalIdentifier: '20202020-c04d-4054-9d54-cd0f1f3f4e5f',
      },
      title: { universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.title },
      isCanceled: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.isCanceled,
      },
      isFullDay: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.isFullDay,
      },
      startsAt: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.startsAt,
      },
      endsAt: { universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.endsAt },
      externalCreatedAt: {
        universalIdentifier:
          CALENDAR_EVENT_STANDARD_FIELD_IDS.externalCreatedAt,
      },
      externalUpdatedAt: {
        universalIdentifier:
          CALENDAR_EVENT_STANDARD_FIELD_IDS.externalUpdatedAt,
      },
      description: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.description,
      },
      location: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.location,
      },
      iCalUID: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.iCalUID,
      },
      conferenceSolution: {
        universalIdentifier:
          CALENDAR_EVENT_STANDARD_FIELD_IDS.conferenceSolution,
      },
      conferenceLink: {
        universalIdentifier: CALENDAR_EVENT_STANDARD_FIELD_IDS.conferenceLink,
      },
      calendarChannelEventAssociations: {
        universalIdentifier:
          CALENDAR_EVENT_STANDARD_FIELD_IDS.calendarChannelEventAssociations,
      },
      calendarEventParticipants: {
        universalIdentifier:
          CALENDAR_EVENT_STANDARD_FIELD_IDS.calendarEventParticipants,
      },
    },
    views: {
      allCalendarEvents: {
        universalIdentifier: '20202020-c001-4c01-8c01-ca1ebe0ca001',
        viewFields: {
          title: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf01',
          },
          startsAt: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf02',
          },
          endsAt: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf03',
          },
          isFullDay: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf04',
          },
          location: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf05',
          },
          conferenceLink: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf06',
          },
          isCanceled: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf07',
          },
          createdAt: {
            universalIdentifier: '20202020-cf01-4c01-8c01-ca1ebe0caf08',
          },
        },
      },
    },
  },
  company: {
    universalIdentifier: STANDARD_OBJECT_IDS.company,
    fields: {
      id: { universalIdentifier: '20202020-c05a-4061-8a61-1e2f3a4b5c6d' },
      createdAt: {
        universalIdentifier: '20202020-c05b-4062-9b62-2f3a4b5c6d7e',
      },
      updatedAt: {
        universalIdentifier: '20202020-c05c-4063-8c63-3a4b5c6d7e8f',
      },
      deletedAt: {
        universalIdentifier: '20202020-c05d-4064-9d64-4b5c6d7e8f9a',
      },
      name: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.name },
      domainName: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.domainName,
      },
      address: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.address },
      addressOld: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.address_deprecated,
      },
      employees: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.employees },
      linkedinLink: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.linkedinLink,
      },
      xLink: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.xLink },
      annualRecurringRevenue: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
      },
      idealCustomerProfile: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.idealCustomerProfile,
      },
      position: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.position },
      createdBy: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.createdBy },
      people: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.people },
      accountOwner: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.accountOwner,
      },
      taskTargets: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.taskTargets,
      },
      noteTargets: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.noteTargets,
      },
      opportunities: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.opportunities,
      },
      favorites: { universalIdentifier: COMPANY_STANDARD_FIELD_IDS.favorites },
      attachments: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.attachments,
      },
      timelineActivities: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.timelineActivities,
      },
      searchVector: {
        universalIdentifier: COMPANY_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allCompanies: {
        universalIdentifier: '20202020-a001-4a01-8a01-c0aba11c0001',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf001',
          },
          domainName: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf002',
          },
          createdBy: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf003',
          },
          accountOwner: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf004',
          },
          createdAt: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf005',
          },
          employees: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf006',
          },
          linkedinLink: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf007',
          },
          address: {
            universalIdentifier: '20202020-af01-4a01-8a01-c0aba11cf008',
          },
        },
      },
    },
  },
  connectedAccount: {
    universalIdentifier: STANDARD_OBJECT_IDS.connectedAccount,
    fields: {
      id: { universalIdentifier: '20202020-c06a-4071-8a71-5c6d7e8f9aab' },
      createdAt: {
        universalIdentifier: '20202020-c06b-4072-9b72-6d7e8f9aabbc',
      },
      updatedAt: {
        universalIdentifier: '20202020-c06c-4073-8c73-7e8f9aabbccd',
      },
      deletedAt: {
        universalIdentifier: '20202020-c06d-4074-9d74-8f9aabbccdde',
      },
      handle: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.handle,
      },
      provider: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.provider,
      },
      accessToken: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.accessToken,
      },
      refreshToken: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.refreshToken,
      },
      accountOwner: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.accountOwner,
      },
      lastSyncHistoryId: {
        universalIdentifier:
          CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.lastSyncHistoryId,
      },
      authFailedAt: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.authFailedAt,
      },
      lastCredentialsRefreshedAt: {
        universalIdentifier:
          CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.lastCredentialsRefreshedAt,
      },
      messageChannels: {
        universalIdentifier:
          CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.messageChannels,
      },
      calendarChannels: {
        universalIdentifier:
          CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.calendarChannels,
      },
      handleAliases: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.handleAliases,
      },
      scopes: {
        universalIdentifier: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.scopes,
      },
      connectionParameters: {
        universalIdentifier:
          CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.connectionParameters,
      },
    },
    views: {},
  },
  dashboard: {
    universalIdentifier: STANDARD_OBJECT_IDS.dashboard,
    fields: {
      id: { universalIdentifier: '20202020-da1a-41d1-8ad1-abcdefabcdef' },
      createdAt: {
        universalIdentifier: '20202020-da1b-41d2-9bd2-bcdefabcdefa',
      },
      updatedAt: {
        universalIdentifier: '20202020-da1c-41d3-8cd3-cdefabcdefab',
      },
      deletedAt: {
        universalIdentifier: '20202020-da1d-41d4-9dd4-defabcdefabc',
      },
      title: { universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.title },
      position: { universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.position },
      pageLayoutId: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.pageLayoutId,
      },
      createdBy: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.createdBy,
      },
      timelineActivities: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.timelineActivities,
      },
      favorites: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.favorites,
      },
      attachments: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.attachments,
      },
      searchVector: {
        universalIdentifier: DASHBOARD_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allDashboards: {
        universalIdentifier: '20202020-a012-4a12-8a12-da5ab0b0a001',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af12-4a12-8a12-da5ab0b0af01',
          },
          createdBy: {
            universalIdentifier: '20202020-af12-4a12-8a12-da5ab0b0af02',
          },
          createdAt: {
            universalIdentifier: '20202020-af12-4a12-8a12-da5ab0b0af03',
          },
          updatedAt: {
            universalIdentifier: '20202020-af12-4a12-8a12-da5ab0b0af04',
          },
        },
      },
    },
  },
  favorite: {
    universalIdentifier: STANDARD_OBJECT_IDS.favorite,
    fields: {
      id: { universalIdentifier: '20202020-f01a-4091-8a91-ddeeffaabbcc' },
      createdAt: {
        universalIdentifier: '20202020-f01b-4092-9b92-eeffaabbccdd',
      },
      updatedAt: {
        universalIdentifier: '20202020-f01c-4093-8c93-ffaabbccddee',
      },
      deletedAt: {
        universalIdentifier: '20202020-f01d-4094-9d94-aabbccddeeff',
      },
      position: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.position },
      forWorkspaceMember: {
        universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.forWorkspaceMember,
      },
      person: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.person },
      company: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.company },
      opportunity: {
        universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.opportunity,
      },
      workflow: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.workflow },
      workflowVersion: {
        universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.workflowVersion,
      },
      workflowRun: {
        universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.workflowRun,
      },
      task: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.task },
      note: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.note },
      view: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.view },
      custom: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.custom },
      favoriteFolder: {
        universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.favoriteFolder,
      },
      dashboard: { universalIdentifier: FAVORITE_STANDARD_FIELD_IDS.dashboard },
    },
    views: {},
  },
  favoriteFolder: {
    universalIdentifier: STANDARD_OBJECT_IDS.favoriteFolder,
    fields: {
      id: { universalIdentifier: '20202020-f02a-40a1-8aa1-1f2e3d4c5b6a' },
      createdAt: {
        universalIdentifier: '20202020-f02b-40a2-9ba2-2f3e4d5c6b7a',
      },
      updatedAt: {
        universalIdentifier: '20202020-f02c-40a3-8ca3-3f4e5d6c7b8a',
      },
      deletedAt: {
        universalIdentifier: '20202020-f02d-40a4-9da4-4f5e6d7c8b9a',
      },
      position: {
        universalIdentifier: FAVORITE_FOLDER_STANDARD_FIELD_IDS.position,
      },
      name: { universalIdentifier: FAVORITE_FOLDER_STANDARD_FIELD_IDS.name },
      favorites: {
        universalIdentifier: FAVORITE_FOLDER_STANDARD_FIELD_IDS.favorites,
      },
    },
    views: {},
  },
  messageChannelMessageAssociation: {
    universalIdentifier: STANDARD_OBJECT_IDS.messageChannelMessageAssociation,
    fields: {
      id: {
        universalIdentifier: '20202020-b01a-40b1-8ab1-5a6b7c8d9eaf',
      },
      createdAt: {
        universalIdentifier: '20202020-b01b-40b2-9bb2-6b7c8d9eafba',
      },
      updatedAt: {
        universalIdentifier: '20202020-b01c-40b3-8cb3-7c8d9eafbacb',
      },
      deletedAt: {
        universalIdentifier: '20202020-b01d-40b4-9db4-8d9eafbacbdc',
      },
      messageChannel: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageChannel,
      },
      message: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.message,
      },
      messageExternalId: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageExternalId,
      },
      messageThread: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageThread,
      },
      messageThreadExternalId: {
        universalIdentifier:
          MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageThreadExternalId,
      },
    },
    views: {},
  },
  messageChannel: {
    universalIdentifier: STANDARD_OBJECT_IDS.messageChannel,
    fields: {
      id: { universalIdentifier: '20202020-b02a-40c1-8ac1-9eafbacbdced' },
      createdAt: {
        universalIdentifier: '20202020-b02b-40c2-9bc2-afbacbdcedfe',
      },
      updatedAt: {
        universalIdentifier: '20202020-b02c-40c3-8cc3-bacbdcedfefa',
      },
      deletedAt: {
        universalIdentifier: '20202020-b02d-40c4-9dc4-cbdcedfefaab',
      },
      visibility: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.visibility,
      },
      handle: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.handle,
      },
      connectedAccount: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
      },
      type: { universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.type },
      isContactAutoCreationEnabled: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.isContactAutoCreationEnabled,
      },
      contactAutoCreationPolicy: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.contactAutoCreationPolicy,
      },
      excludeNonProfessionalEmails: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.excludeNonProfessionalEmails,
      },
      excludeGroupEmails: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.excludeGroupEmails,
      },
      messageChannelMessageAssociations: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
      },
      messageFolders: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.messageFolders,
      },
      messageFolderImportPolicy: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.messageFolderImportPolicy,
      },
      pendingGroupEmailsAction: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.pendingGroupEmailsAction,
      },
      isSyncEnabled: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.isSyncEnabled,
      },
      syncCursor: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncCursor,
      },
      syncedAt: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncedAt,
      },
      syncStatus: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
      },
      syncStage: {
        universalIdentifier: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStage,
      },
      syncStageStartedAt: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStageStartedAt,
      },
      throttleFailureCount: {
        universalIdentifier:
          MESSAGE_CHANNEL_STANDARD_FIELD_IDS.throttleFailureCount,
      },
    },
    views: {},
  },
  messageFolder: {
    universalIdentifier: STANDARD_OBJECT_IDS.messageFolder,
    fields: {
      id: { universalIdentifier: '20202020-b03a-40d1-8ad1-dcedfefaabbc' },
      createdAt: {
        universalIdentifier: '20202020-b03b-40d2-9bd2-edfefaabbccd',
      },
      updatedAt: {
        universalIdentifier: '20202020-b03c-40d3-8cd3-fefaabbccdde',
      },
      deletedAt: {
        universalIdentifier: '20202020-b03d-40d4-9dd4-faabbccddeef',
      },
      name: { universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.name },
      parentFolderId: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.parentFolderId,
      },
      messageChannel: {
        universalIdentifier: '20202020-c9f8-43db-a3e7-7f2e8b5d9c1a',
      },
      syncCursor: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.syncCursor,
      },
      isSentFolder: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.isSentFolder,
      },
      isSynced: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.isSynced,
      },
      externalId: {
        universalIdentifier: MESSAGE_FOLDER_STANDARD_FIELD_IDS.externalId,
      },
      pendingSyncAction: {
        universalIdentifier:
          MESSAGE_FOLDER_STANDARD_FIELD_IDS.pendingSyncAction,
      },
    },
    views: {},
  },
  messageParticipant: {
    universalIdentifier: STANDARD_OBJECT_IDS.messageParticipant,
    fields: {
      id: { universalIdentifier: '20202020-b04a-40e1-8ae1-1a2b3c4d5e6f' },
      createdAt: {
        universalIdentifier: '20202020-b04b-40e2-9be2-2b3c4d5e6f7a',
      },
      updatedAt: {
        universalIdentifier: '20202020-b04c-40e3-8ce3-3c4d5e6f7a8b',
      },
      deletedAt: {
        universalIdentifier: '20202020-b04d-40e4-9de4-4d5e6f7a8b9c',
      },
      message: {
        universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.message,
      },
      role: {
        universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.role,
      },
      handle: {
        universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.handle,
      },
      displayName: {
        universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.displayName,
      },
      person: {
        universalIdentifier: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.person,
      },
      workspaceMember: {
        universalIdentifier:
          MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.workspaceMember,
      },
    },
    views: {},
  },
  messageThread: {
    universalIdentifier: STANDARD_OBJECT_IDS.messageThread,
    fields: {
      id: { universalIdentifier: '20202020-b05a-40f1-8af1-5e6f7a8b9cad' },
      createdAt: {
        universalIdentifier: '20202020-b05b-40f2-9bf2-6f7a8b9cadbe',
      },
      updatedAt: {
        universalIdentifier: '20202020-b05c-40f3-8cf3-7a8b9cadbecf',
      },
      deletedAt: {
        universalIdentifier: '20202020-b05d-40f4-9df4-8b9cadbecfda',
      },
      messages: {
        universalIdentifier: MESSAGE_THREAD_STANDARD_FIELD_IDS.messages,
      },
      messageChannelMessageAssociations: {
        universalIdentifier:
          MESSAGE_THREAD_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
      },
      messageThreadSubscribers: {
        universalIdentifier:
          MESSAGE_THREAD_STANDARD_FIELD_IDS.messageThreadSubscribers,
      },
    },
    views: {
      allMessageThreads: {
        universalIdentifier: '20202020-d002-4d02-8d02-ae55a9ba2002',
        viewFields: {
          messages: {
            universalIdentifier: '20202020-df02-4d02-8d02-ae55a9ba2f01',
          },
          createdAt: {
            universalIdentifier: '20202020-df02-4d02-8d02-ae55a9ba2f02',
          },
        },
      },
    },
  },
  message: {
    universalIdentifier: STANDARD_OBJECT_IDS.message,
    fields: {
      id: { universalIdentifier: '20202020-b06a-4101-8a01-9cadbedfaeb1' },
      createdAt: {
        universalIdentifier: '20202020-b06b-4102-9b02-adbecfeafbc2',
      },
      updatedAt: {
        universalIdentifier: '20202020-b06c-4103-8c03-becfdfabfcd3',
      },
      deletedAt: {
        universalIdentifier: '20202020-b06d-4104-9d04-cfdfabecdde4',
      },
      headerMessageId: {
        universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.headerMessageId,
      },
      messageThread: {
        universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.messageThread,
      },
      direction: {
        universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.direction,
      },
      subject: { universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.subject },
      text: { universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.text },
      receivedAt: {
        universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.receivedAt,
      },
      messageParticipants: {
        universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.messageParticipants,
      },
      messageChannelMessageAssociations: {
        universalIdentifier:
          MESSAGE_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
      },
    },
    views: {
      allMessages: {
        universalIdentifier: '20202020-d001-4d01-8d01-ae55a9e5a001',
        viewFields: {
          subject: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af01',
          },
          messageThread: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af02',
          },
          messageParticipants: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af03',
          },
          receivedAt: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af04',
          },
          headerMessageId: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af05',
          },
          text: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af06',
          },
          createdAt: {
            universalIdentifier: '20202020-df01-4d01-8d01-ae55a9e5af07',
          },
        },
      },
    },
  },
  note: {
    universalIdentifier: STANDARD_OBJECT_IDS.note,
    fields: {
      id: { universalIdentifier: '20202020-c01a-4111-8a11-dfabcddeef12' },
      createdAt: {
        universalIdentifier: '20202020-c01b-4112-9b12-fabcddefe123',
      },
      updatedAt: {
        universalIdentifier: '20202020-c01c-4113-8c13-abcddeef1234',
      },
      deletedAt: {
        universalIdentifier: '20202020-c01d-4114-9d14-bcddeef12345',
      },
      position: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.position },
      title: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.title },
      body: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.body },
      bodyV2: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.bodyV2 },
      createdBy: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.createdBy },
      noteTargets: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.noteTargets },
      attachments: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.attachments },
      timelineActivities: {
        universalIdentifier: NOTE_STANDARD_FIELD_IDS.timelineActivities,
      },
      favorites: { universalIdentifier: NOTE_STANDARD_FIELD_IDS.favorites },
      searchVector: {
        universalIdentifier: NOTE_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allNotes: {
        universalIdentifier: '20202020-a005-4a05-8a05-a0be5a11a000',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af00',
          },
          noteTargets: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af01',
          },
          bodyV2: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af02',
          },
          createdBy: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af03',
          },
          createdAt: {
            universalIdentifier: '20202020-af05-4a05-8a05-a0be5a11af04',
          },
        },
      },
    },
  },
  noteTarget: {
    universalIdentifier: STANDARD_OBJECT_IDS.noteTarget,
    fields: {
      id: { universalIdentifier: '20202020-c02a-4121-8a21-cddeef123456' },
      createdAt: {
        universalIdentifier: '20202020-c02b-4122-9b22-ddeef1234567',
      },
      updatedAt: {
        universalIdentifier: '20202020-c02c-4123-8c23-eef12345678a',
      },
      deletedAt: {
        universalIdentifier: '20202020-c02d-4124-9d24-ef123456789b',
      },
      note: { universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.note },
      person: { universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.person },
      company: { universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.company },
      opportunity: {
        universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.opportunity,
      },
      custom: { universalIdentifier: NOTE_TARGET_STANDARD_FIELD_IDS.custom },
    },
    views: {},
  },
  opportunity: {
    universalIdentifier: STANDARD_OBJECT_IDS.opportunity,
    fields: {
      id: { universalIdentifier: '20202020-d01a-4131-8a31-f123456789ab' },
      createdAt: {
        universalIdentifier: '20202020-d01b-4132-9b32-123456789abc',
      },
      updatedAt: {
        universalIdentifier: '20202020-d01c-4133-8c33-23456789abcd',
      },
      deletedAt: {
        universalIdentifier: '20202020-d01d-4134-9d34-3456789abcde',
      },
      name: { universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.name },
      amount: { universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.amount },
      closeDate: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.closeDate,
      },
      stage: { universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.stage },
      position: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.position,
      },
      createdBy: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.createdBy,
      },
      pointOfContact: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.pointOfContact,
      },
      company: { universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.company },
      favorites: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.favorites,
      },
      taskTargets: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.taskTargets,
      },
      noteTargets: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.noteTargets,
      },
      attachments: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.attachments,
      },
      timelineActivities: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.timelineActivities,
      },
      searchVector: {
        universalIdentifier: OPPORTUNITY_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allOpportunities: {
        universalIdentifier: '20202020-a003-4a03-8a03-0aa0b1ca1ba0',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1baf',
          },
          amount: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1bb0',
          },
          createdBy: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1bb1',
          },
          closeDate: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1bb2',
          },
          company: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1bb3',
          },
          pointOfContact: {
            universalIdentifier: '20202020-af03-4a03-8a03-0aa0b1ca1bb4',
          },
        },
      },
      byStage: {
        universalIdentifier: '20202020-a004-4a04-8a04-0aa0b1ca1ba0',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2baf',
          },
          amount: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2bb0',
          },
          createdBy: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2bb1',
          },
          closeDate: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2bb2',
          },
          company: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2bb3',
          },
          pointOfContact: {
            universalIdentifier: '20202020-af04-4a04-8a04-0aa0b2ca2bb4',
          },
        },
        viewGroups: {
          new: {
            universalIdentifier: '20202020-af14-4a04-8a04-0aa0b2ca2bf1',
          },
          screening: {
            universalIdentifier: '20202020-af14-4a04-8a04-0aa0b2ca2bf2',
          },
          meeting: {
            universalIdentifier: '20202020-af14-4a04-8a04-0aa0b2ca2bf3',
          },
          proposal: {
            universalIdentifier: '20202020-af14-4a04-8a04-0aa0b2ca2bf4',
          },
          customer: {
            universalIdentifier: '20202020-af14-4a04-8a04-0aa0b2ca2bf5',
          },
        },
      },
    },
  },
  person: {
    universalIdentifier: STANDARD_OBJECT_IDS.person,
    fields: {
      id: { universalIdentifier: '20202020-e01a-4141-8a41-456789abcdef' },
      createdAt: {
        universalIdentifier: '20202020-e01b-4142-9b42-56789abcdefa',
      },
      updatedAt: {
        universalIdentifier: '20202020-e01c-4143-8c43-6789abcdefab',
      },
      deletedAt: {
        universalIdentifier: '20202020-e01d-4144-9d44-789abcdefabc',
      },
      name: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.name },
      email: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.email },
      emails: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.emails },
      linkedinLink: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.linkedinLink,
      },
      xLink: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.xLink },
      jobTitle: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.jobTitle },
      phone: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.phone },
      phones: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.phones },
      city: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.city },
      avatarUrl: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.avatarUrl },
      position: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.position },
      createdBy: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.createdBy },
      company: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.company },
      pointOfContactForOpportunities: {
        universalIdentifier:
          PERSON_STANDARD_FIELD_IDS.pointOfContactForOpportunities,
      },
      taskTargets: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.taskTargets,
      },
      noteTargets: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.noteTargets,
      },
      favorites: { universalIdentifier: PERSON_STANDARD_FIELD_IDS.favorites },
      attachments: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.attachments,
      },
      messageParticipants: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.messageParticipants,
      },
      calendarEventParticipants: {
        universalIdentifier:
          PERSON_STANDARD_FIELD_IDS.calendarEventParticipants,
      },
      timelineActivities: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.timelineActivities,
      },
      searchVector: {
        universalIdentifier: PERSON_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allPeople: {
        universalIdentifier: '20202020-a002-4a02-8a02-ae0a1ea11a00',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af0',
          },
          emails: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af1',
          },
          createdBy: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af2',
          },
          company: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af3',
          },
          phones: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af4',
          },
          createdAt: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af5',
          },
          city: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af6',
          },
          jobTitle: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af7',
          },
          linkedinLink: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af8',
          },
          xLink: {
            universalIdentifier: '20202020-af02-4a02-8a02-ae0a1ea11af9',
          },
        },
      },
    },
  },
  task: {
    universalIdentifier: STANDARD_OBJECT_IDS.task,
    fields: {
      id: { universalIdentifier: '20202020-a02a-4151-8a51-89abcdefabcd' },
      createdAt: {
        universalIdentifier: '20202020-a02b-4152-9b52-9abcdefabcde',
      },
      updatedAt: {
        universalIdentifier: '20202020-a02c-4153-8c53-abcdefabcdef',
      },
      deletedAt: {
        universalIdentifier: '20202020-a02d-4154-9d54-bcdefabcdefa',
      },
      position: { universalIdentifier: TASK_STANDARD_FIELD_IDS.position },
      title: { universalIdentifier: TASK_STANDARD_FIELD_IDS.title },
      body: { universalIdentifier: TASK_STANDARD_FIELD_IDS.body },
      bodyV2: { universalIdentifier: TASK_STANDARD_FIELD_IDS.bodyV2 },
      dueAt: { universalIdentifier: TASK_STANDARD_FIELD_IDS.dueAt },
      status: { universalIdentifier: TASK_STANDARD_FIELD_IDS.status },
      createdBy: { universalIdentifier: TASK_STANDARD_FIELD_IDS.createdBy },
      taskTargets: { universalIdentifier: TASK_STANDARD_FIELD_IDS.taskTargets },
      attachments: { universalIdentifier: TASK_STANDARD_FIELD_IDS.attachments },
      assignee: { universalIdentifier: TASK_STANDARD_FIELD_IDS.assignee },
      timelineActivities: {
        universalIdentifier: TASK_STANDARD_FIELD_IDS.timelineActivities,
      },
      favorites: { universalIdentifier: TASK_STANDARD_FIELD_IDS.favorites },
      searchVector: {
        universalIdentifier: TASK_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allTasks: {
        universalIdentifier: '20202020-a006-4a06-8a06-ba5ca11a1ea0',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eaf',
          },
          status: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb0',
          },
          taskTargets: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb1',
          },
          createdBy: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb2',
          },
          dueAt: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb3',
          },
          assignee: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb4',
          },
          bodyV2: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb5',
          },
          createdAt: {
            universalIdentifier: '20202020-af06-4a06-8a06-ba5ca11a1eb6',
          },
        },
      },
      assignedToMe: {
        universalIdentifier: '20202020-a007-4a07-8a07-ba5ca551aaed',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaed',
          },
          taskTargets: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaee',
          },
          createdBy: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaef',
          },
          dueAt: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaf0',
          },
          assignee: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaf1',
          },
          bodyV2: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaf2',
          },
          createdAt: {
            universalIdentifier: '20202020-af07-4a07-8a07-ba5ca551aaf3',
          },
        },
        viewFilters: {
          assigneeIsMe: {
            universalIdentifier: '20202020-af17-4a07-8a07-ba5ca551abf1',
          },
        },
        viewGroups: {
          todo: {
            universalIdentifier: '20202020-af17-4a07-8a07-ba5ca551abf2',
          },
          inProgress: {
            universalIdentifier: '20202020-af17-4a07-8a07-ba5ca551abf3',
          },
          done: {
            universalIdentifier: '20202020-af17-4a07-8a07-ba5ca551abf4',
          },
          empty: {
            universalIdentifier: '20202020-af17-4a07-8a07-ba5ca551abf5',
          },
        },
      },
      byStatus: {
        universalIdentifier: '20202020-a008-4a08-8a08-ba5cba51aba5',
        viewFields: {
          title: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf0',
          },
          status: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf1',
          },
          dueAt: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf2',
          },
          assignee: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf3',
          },
          createdAt: {
            universalIdentifier: '20202020-af08-4a08-8a08-ba5cba5babf4',
          },
        },
        viewGroups: {
          todo: {
            universalIdentifier: '20202020-af18-4a08-8a08-ba5cba5bbf01',
          },
          inProgress: {
            universalIdentifier: '20202020-af18-4a08-8a08-ba5cba5bbf02',
          },
          done: {
            universalIdentifier: '20202020-af18-4a08-8a08-ba5cba5bbf03',
          },
        },
      },
    },
  },
  taskTarget: {
    universalIdentifier: STANDARD_OBJECT_IDS.taskTarget,
    fields: {
      id: { universalIdentifier: '20202020-a03a-4161-8a61-cdefabcdefab' },
      createdAt: {
        universalIdentifier: '20202020-a03b-4162-9b62-defabcdefabc',
      },
      updatedAt: {
        universalIdentifier: '20202020-a03c-4163-8c63-efabcdefabcd',
      },
      deletedAt: {
        universalIdentifier: '20202020-a03d-4164-9d64-fabcdefabcde',
      },
      task: { universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.task },
      person: { universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.person },
      company: { universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.company },
      opportunity: {
        universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.opportunity,
      },
      custom: { universalIdentifier: TASK_TARGET_STANDARD_FIELD_IDS.custom },
    },
    views: {},
  },
  timelineActivity: {
    universalIdentifier: STANDARD_OBJECT_IDS.timelineActivity,
    fields: {
      id: { universalIdentifier: '20202020-a01a-4081-8a81-9aabbccddeff' },
      createdAt: {
        universalIdentifier: '20202020-a01b-4082-9b82-aabbccddeeff',
      },
      updatedAt: {
        universalIdentifier: '20202020-a01c-4083-8c83-bbccddeeffaa',
      },
      deletedAt: {
        universalIdentifier: '20202020-a01d-4084-9d84-ccddeeffaabb',
      },
      happensAt: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.happensAt,
      },
      type: { universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.type },
      name: { universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.name },
      properties: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.properties,
      },
      workspaceMember: {
        universalIdentifier:
          TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.workspaceMember,
      },
      person: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.person,
      },
      company: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.company,
      },
      opportunity: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.opportunity,
      },
      task: { universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.task },
      note: { universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.note },
      workflow: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.workflow,
      },
      workflowVersion: {
        universalIdentifier:
          TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.workflowVersion,
      },
      workflowRun: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.workflowRun,
      },
      dashboard: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.dashboard,
      },
      custom: {
        universalIdentifier: '20202020-a9b2-4f85-b3c7-6d8e9f1a4c2b',
      },
      linkedRecordCachedName: {
        universalIdentifier:
          TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.linkedRecordCachedName,
      },
      linkedRecordId: {
        universalIdentifier:
          TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.linkedRecordId,
      },
      linkedObjectMetadataId: {
        universalIdentifier:
          TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.linkedObjectMetadataId,
      },
      targetMorphId: {
        universalIdentifier: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetMorphId,
      },
    },
    views: {
      allTimelineActivities: {
        universalIdentifier: '20202020-b101-4b01-8b01-ba5cc01aa001',
        viewFields: {
          name: {
            universalIdentifier: '20202020-bf01-4b01-8b01-ba5cc01aa011',
          },
          happensAt: {
            universalIdentifier: '20202020-bf01-4b01-8b01-ba5cc01aa012',
          },
          properties: {
            universalIdentifier: '20202020-bf01-4b01-8b01-ba5cc01aa019',
          },
          workspaceMember: {
            universalIdentifier: '20202020-bf01-4b01-8b01-ba5cc01aa013',
          },
          linkedRecordCachedName: {
            universalIdentifier: '20202020-bf01-4b01-8b01-ba5cc01aa017',
          },
        },
      },
    },
  },
  view: {
    universalIdentifier: STANDARD_OBJECT_IDS.view,
    fields: {
      name: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.name },
      objectMetadataId: {
        universalIdentifier: VIEW_STANDARD_FIELD_IDS.objectMetadataId,
      },
      type: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.type },
      key: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.key },
      icon: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.icon },
      kanbanFieldMetadataId: {
        universalIdentifier: VIEW_STANDARD_FIELD_IDS.kanbanFieldMetadataId,
      },
      kanbanAggregateOperation: {
        universalIdentifier: VIEW_STANDARD_FIELD_IDS.kanbanAggregateOperation,
      },
      kanbanAggregateOperationFieldMetadataId: {
        universalIdentifier:
          VIEW_STANDARD_FIELD_IDS.kanbanAggregateOperationFieldMetadataId,
      },
      mainGroupByFieldMetadataId: {
        universalIdentifier: VIEW_STANDARD_FIELD_IDS.mainGroupByFieldMetadataId,
      },
      position: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.position },
      isCompact: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.isCompact },
      openRecordIn: {
        universalIdentifier: VIEW_STANDARD_FIELD_IDS.openRecordIn,
      },
      viewFields: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.viewFields },
      viewGroups: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.viewGroups },
      viewFilters: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.viewFilters },
      viewFilterGroups: {
        universalIdentifier: VIEW_STANDARD_FIELD_IDS.viewFilterGroups,
      },
      viewSorts: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.viewSorts },
      favorites: { universalIdentifier: VIEW_STANDARD_FIELD_IDS.favorites },
      anyFieldFilterValue: {
        universalIdentifier: VIEW_STANDARD_FIELD_IDS.anyFieldFilterValue,
      },
    },
    views: {},
  },
  viewField: {
    universalIdentifier: STANDARD_OBJECT_IDS.viewField,
    fields: {
      fieldMetadataId: {
        universalIdentifier: VIEW_FIELD_STANDARD_FIELD_IDS.fieldMetadataId,
      },
      isVisible: {
        universalIdentifier: VIEW_FIELD_STANDARD_FIELD_IDS.isVisible,
      },
      size: { universalIdentifier: VIEW_FIELD_STANDARD_FIELD_IDS.size },
      position: { universalIdentifier: VIEW_FIELD_STANDARD_FIELD_IDS.position },
      view: { universalIdentifier: VIEW_FIELD_STANDARD_FIELD_IDS.view },
      aggregateOperation: {
        universalIdentifier: VIEW_FIELD_STANDARD_FIELD_IDS.aggregateOperation,
      },
    },
    views: {},
  },
  viewFilter: {
    universalIdentifier: STANDARD_OBJECT_IDS.viewFilter,
    fields: {
      fieldMetadataId: {
        universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.fieldMetadataId,
      },
      operand: { universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.operand },
      value: { universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.value },
      displayValue: {
        universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.displayValue,
      },
      view: { universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.view },
      viewFilterGroupId: {
        universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.viewFilterGroupId,
      },
      positionInViewFilterGroup: {
        universalIdentifier:
          VIEW_FILTER_STANDARD_FIELD_IDS.positionInViewFilterGroup,
      },
      subFieldName: {
        universalIdentifier: VIEW_FILTER_STANDARD_FIELD_IDS.subFieldName,
      },
    },
    views: {},
  },
  viewFilterGroup: {
    universalIdentifier: STANDARD_OBJECT_IDS.viewFilterGroup,
    fields: {
      view: { universalIdentifier: VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.view },
      parentViewFilterGroupId: {
        universalIdentifier:
          VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.parentViewFilterGroupId,
      },
      logicalOperator: {
        universalIdentifier:
          VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.logicalOperator,
      },
      positionInViewFilterGroup: {
        universalIdentifier:
          VIEW_FILTER_GROUP_STANDARD_FIELD_IDS.positionInViewFilterGroup,
      },
    },
    views: {},
  },
  viewGroup: {
    universalIdentifier: STANDARD_OBJECT_IDS.viewGroup,
    fields: {
      fieldMetadataId: {
        universalIdentifier: VIEW_GROUP_STANDARD_FIELD_IDS.fieldMetadataId,
      },
      fieldValue: {
        universalIdentifier: VIEW_GROUP_STANDARD_FIELD_IDS.fieldValue,
      },
      isVisible: {
        universalIdentifier: VIEW_GROUP_STANDARD_FIELD_IDS.isVisible,
      },
      position: { universalIdentifier: VIEW_GROUP_STANDARD_FIELD_IDS.position },
      view: { universalIdentifier: VIEW_GROUP_STANDARD_FIELD_IDS.view },
    },
    views: {},
  },
  viewSort: {
    universalIdentifier: STANDARD_OBJECT_IDS.viewSort,
    fields: {
      fieldMetadataId: {
        universalIdentifier: VIEW_SORT_STANDARD_FIELD_IDS.fieldMetadataId,
      },
      direction: {
        universalIdentifier: VIEW_SORT_STANDARD_FIELD_IDS.direction,
      },
      view: { universalIdentifier: VIEW_SORT_STANDARD_FIELD_IDS.view },
    },
    views: {},
  },
  workflow: {
    universalIdentifier: STANDARD_OBJECT_IDS.workflow,
    fields: {
      id: { universalIdentifier: '20202020-f02a-4181-8a81-efabcdefabcd' },
      createdAt: {
        universalIdentifier: '20202020-f02b-4182-9b82-fabcdefabcde',
      },
      updatedAt: {
        universalIdentifier: '20202020-f02c-4183-8c83-abcdefabcdef',
      },
      deletedAt: {
        universalIdentifier: '20202020-f02d-4184-9d84-bcdefabcdefa',
      },
      name: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.name },
      lastPublishedVersionId: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.lastPublishedVersionId,
      },
      statuses: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.statuses },
      position: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.position },
      versions: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.versions },
      runs: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.runs },
      eventListeners: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.eventListeners,
      },
      automatedTriggers: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.automatedTriggers,
      },
      favorites: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.favorites },
      timelineActivities: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.timelineActivities,
      },
      attachments: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.attachments,
      },
      createdBy: { universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.createdBy },
      searchVector: {
        universalIdentifier: WORKFLOW_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allWorkflows: {
        universalIdentifier: '20202020-a009-4a09-8a09-a0bcf10aa11a',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11a',
          },
          statuses: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11b',
          },
          updatedAt: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11c',
          },
          createdBy: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11d',
          },
          versions: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11e',
          },
          runs: {
            universalIdentifier: '20202020-af09-4a09-8a09-a0bcf10aa11f',
          },
        },
      },
    },
  },
  workflowAutomatedTrigger: {
    universalIdentifier: STANDARD_OBJECT_IDS.workflowAutomatedTrigger,
    fields: {
      id: {
        universalIdentifier: '20202020-f01a-4171-8a71-abcdefabcdef',
      },
      createdAt: {
        universalIdentifier: '20202020-f01b-4172-9b72-bcdefabcdefa',
      },
      updatedAt: {
        universalIdentifier: '20202020-f01c-4173-8c73-cdefabcdefab',
      },
      deletedAt: {
        universalIdentifier: '20202020-f01d-4174-9d74-defabcdefabc',
      },
      type: {
        universalIdentifier: WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.type,
      },
      settings: {
        universalIdentifier:
          WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.settings,
      },
      workflow: {
        universalIdentifier:
          WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS.workflow,
      },
    },
    views: {},
  },
  workflowRun: {
    universalIdentifier: STANDARD_OBJECT_IDS.workflowRun,
    fields: {
      id: { universalIdentifier: '20202020-f03a-4191-8a91-cdefabcdefab' },
      createdAt: {
        universalIdentifier: '20202020-f03b-4192-9b92-defabcdefabc',
      },
      updatedAt: {
        universalIdentifier: '20202020-f03c-4193-8c93-efabcdefabcd',
      },
      deletedAt: {
        universalIdentifier: '20202020-f03d-4194-9d94-fabcdefabcde',
      },
      name: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.name },
      workflowVersion: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.workflowVersion,
      },
      workflow: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.workflow,
      },
      enqueuedAt: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.enqueuedAt,
      },
      startedAt: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.startedAt,
      },
      endedAt: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.endedAt },
      status: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.status },
      position: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.position,
      },
      createdBy: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.createdBy,
      },
      output: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.output },
      context: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.context },
      state: { universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.state },
      favorites: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.favorites,
      },
      timelineActivities: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.timelineActivities,
      },
      searchVector: {
        universalIdentifier: WORKFLOW_RUN_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allWorkflowRuns: {
        universalIdentifier: '20202020-a011-4a11-8a11-a0bcf10abca5',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcaf',
          },
          workflow: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcb0',
          },
          status: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcb1',
          },
          startedAt: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcb2',
          },
          createdBy: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcb3',
          },
          workflowVersion: {
            universalIdentifier: '20202020-af11-4a11-8a11-a0bcf10abcb4',
          },
        },
      },
    },
  },
  workflowVersion: {
    universalIdentifier: STANDARD_OBJECT_IDS.workflowVersion,
    fields: {
      id: { universalIdentifier: '20202020-f04a-41a1-8aa1-abcdefabcdef' },
      createdAt: {
        universalIdentifier: '20202020-f04b-41a2-9ba2-bcdefabcdefa',
      },
      updatedAt: {
        universalIdentifier: '20202020-f04c-41a3-8ca3-cdefabcdefab',
      },
      deletedAt: {
        universalIdentifier: '20202020-f04d-41a4-9da4-defabcdefabc',
      },
      name: { universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.name },
      workflow: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.workflow,
      },
      trigger: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.trigger,
      },
      status: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.status,
      },
      position: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.position,
      },
      runs: { universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.runs },
      steps: { universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.steps },
      favorites: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.favorites,
      },
      timelineActivities: {
        universalIdentifier:
          WORKFLOW_VERSION_STANDARD_FIELD_IDS.timelineActivities,
      },
      searchVector: {
        universalIdentifier: WORKFLOW_VERSION_STANDARD_FIELD_IDS.searchVector,
      },
    },
    views: {
      allWorkflowVersions: {
        universalIdentifier: '20202020-a010-4a10-8a10-a0bcf10aae15',
        viewFields: {
          name: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeaf',
          },
          workflow: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeb0',
          },
          status: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeb1',
          },
          updatedAt: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeb2',
          },
          runs: {
            universalIdentifier: '20202020-af10-4a10-8a10-a0bcf10aaeb3',
          },
        },
      },
    },
  },
  workspaceMember: {
    universalIdentifier: STANDARD_OBJECT_IDS.workspaceMember,
    fields: {
      id: { universalIdentifier: '20202020-fb1a-41b1-8ab1-efabcdefabcd' },
      createdAt: {
        universalIdentifier: '20202020-fb1b-41b2-9bb2-fabcdefabcde',
      },
      updatedAt: {
        universalIdentifier: '20202020-fb1c-41b3-8cb3-abcdefabcdef',
      },
      deletedAt: {
        universalIdentifier: '20202020-fb1d-41b4-9db4-bcdefabcdefa',
      },
      position: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.position,
      },
      name: { universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.name },
      colorScheme: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.colorScheme,
      },
      locale: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.locale,
      },
      avatarUrl: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.avatarUrl,
      },
      userEmail: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.userEmail,
      },
      userId: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.userId,
      },
      authoredActivities: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredActivities,
      },
      assignedActivities: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.assignedActivities,
      },
      assignedTasks: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.assignedTasks,
      },
      favorites: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.favorites,
      },
      accountOwnerForCompanies: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.accountOwnerForCompanies,
      },
      authoredAttachments: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredAttachments,
      },
      authoredComments: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredComments,
      },
      connectedAccounts: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.connectedAccounts,
      },
      messageParticipants: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.messageParticipants,
      },
      blocklist: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.blocklist,
      },
      calendarEventParticipants: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.calendarEventParticipants,
      },
      timelineActivities: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timelineActivities,
      },
      auditLogs: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.auditLogs,
      },
      messageThreadSubscribers: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.messageThreadSubscribers,
      },
      timeZone: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timeZone,
      },
      dateFormat: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.dateFormat,
      },
      timeFormat: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timeFormat,
      },
      searchVector: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.searchVector,
      },
      calendarStartDay: {
        universalIdentifier:
          WORKSPACE_MEMBER_STANDARD_FIELD_IDS.calendarStartDay,
      },
      numberFormat: {
        universalIdentifier: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.numberFormat,
      },
    },
    views: {
      allWorkspaceMembers: {
        universalIdentifier: '20202020-e001-4e01-8e01-a0bcaeabe100',
        viewFields: {
          name: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f0',
          },
          userEmail: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f1',
          },
          avatarUrl: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f2',
          },
          colorScheme: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f3',
          },
          locale: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f4',
          },
          timeZone: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f5',
          },
          dateFormat: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f6',
          },
          timeFormat: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f7',
          },
          createdAt: {
            universalIdentifier: '20202020-ef01-4e01-8e01-a0bcaeabe1f8',
          },
        },
      },
    },
  },
} as const satisfies Record<
  string,
  {
    universalIdentifier: string;
    fields: Record<string, { universalIdentifier: string }>;
    views: Record<
      string,
      {
        universalIdentifier: string;
        viewFields: Record<string, { universalIdentifier: string }>;
        viewFilters?: Record<string, { universalIdentifier: string }>;
        viewGroups?: Record<string, { universalIdentifier: string }>;
      }
    >;
  }
>;
