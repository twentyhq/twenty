type KnownConstantValue = string | number | Record<string, string | number>;

export const KNOWN_CONSTANTS: Record<string, KnownConstantValue> = {
  BACKEND_BATCH_REQUEST_MAX_COUNT: 10000,
  MUTATION_MAX_MERGE_RECORDS: 9,

  CoreObjectNameSingular: {
    Activity: 'activity',
    ActivityTarget: 'activityTarget',
    ApiKey: 'apiKey',
    Attachment: 'attachment',
    Blocklist: 'blocklist',
    CalendarChannel: 'calendarChannel',
    CalendarEvent: 'calendarEvent',
    Comment: 'comment',
    Company: 'company',
    ConnectedAccount: 'connectedAccount',
    Dashboard: 'dashboard',
    TimelineActivity: 'timelineActivity',
    Favorite: 'favorite',
    FavoriteFolder: 'favoriteFolder',
    Message: 'message',
    MessageChannel: 'messageChannel',
    MessageParticipant: 'messageParticipant',
    MessageFolder: 'messageFolder',
    MessageThread: 'messageThread',
    Note: 'note',
    NoteTarget: 'noteTarget',
    Opportunity: 'opportunity',
    Person: 'person',
    Task: 'task',
    TaskTarget: 'taskTarget',
    Webhook: 'webhook',
    WorkspaceMember: 'workspaceMember',
    MessageThreadSubscriber: 'messageThreadSubscriber',
    Workflow: 'workflow',
    MessageChannelMessageAssociation: 'messageChannelMessageAssociation',
    WorkflowVersion: 'workflowVersion',
    WorkflowRun: 'workflowRun',
  },

  FeatureFlagKey: {
    IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED:
      'IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED',
    IS_COMMAND_MENU_ITEM_ENABLED: 'IS_COMMAND_MENU_ITEM_ENABLED',
    IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED:
      'IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED',
  },

  ActionViewType: {
    GLOBAL: 'GLOBAL',
    INDEX_PAGE_BULK_SELECTION: 'INDEX_PAGE_BULK_SELECTION',
    INDEX_PAGE_SINGLE_RECORD_SELECTION: 'INDEX_PAGE_SINGLE_RECORD_SELECTION',
    INDEX_PAGE_NO_SELECTION: 'INDEX_PAGE_NO_SELECTION',
    SHOW_PAGE: 'SHOW_PAGE',
    PAGE_EDIT_MODE: 'PAGE_EDIT_MODE',
  },
};
