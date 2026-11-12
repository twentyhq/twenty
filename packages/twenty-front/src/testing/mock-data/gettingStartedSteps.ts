import {
  type GettingStartedProgressQuery,
  GettingStartedStepActionKey,
  GettingStartedStepKind,
} from '~/generated-metadata/graphql';

export const mockGettingStartedStepDefinitions: GettingStartedProgressQuery['gettingStartedProgress']['steps'] =
  [
    {
      __typename: 'GettingStartedStepDefinition',
      actionKey: GettingStartedStepActionKey.CONNECT_MAILBOX,
      kind: GettingStartedStepKind.CUSTOM,
      title: 'Import your contacts',
      doneTitle: 'Mailbox connected',
      description:
        'Connect your email and calendar to see your entire network instantly. Takes only 30 seconds.',
      doneDescription:
        'Companies and people fill in from your emails and meetings.',
      icon: 'IconAt',
      iconColor: 'blue',
      promptLabel: null,
      prompt: null,
      doneChatThreadId: null,
    },
    {
      __typename: 'GettingStartedStepDefinition',
      actionKey: GettingStartedStepActionKey.IMPORT_DATA,
      kind: GettingStartedStepKind.CUSTOM,
      title: 'Import your data',
      doneTitle: 'Data imported',
      description:
        'Bring your companies, contacts and deals from any CRM export.',
      doneDescription: 'Your records are in, organized around how you work.',
      icon: 'IconFileImport',
      iconColor: 'gray',
      promptLabel: null,
      prompt: null,
      doneChatThreadId: null,
    },
    {
      __typename: 'GettingStartedStepDefinition',
      actionKey: GettingStartedStepActionKey.INSTALL_APP,
      kind: GettingStartedStepKind.CUSTOM,
      title: 'Install an app',
      doneTitle: 'App installed',
      description: 'Add tools to your workspace.',
      doneDescription: 'Manage your apps in settings.',
      icon: 'IconApps',
      iconColor: 'turquoise',
      promptLabel: null,
      prompt: null,
      doneChatThreadId: null,
    },
    {
      __typename: 'GettingStartedStepDefinition',
      actionKey: GettingStartedStepActionKey.INVITE_TEAM,
      kind: GettingStartedStepKind.CUSTOM,
      title: 'Invite your team',
      doneTitle: 'Invitations sent',
      description: 'Bring your team into Twenty.',
      doneDescription: 'Invites are out. Bring in more people anytime.',
      icon: 'IconUsers',
      iconColor: 'orange',
      promptLabel: null,
      prompt: null,
      doneChatThreadId: null,
    },
    {
      __typename: 'GettingStartedStepDefinition',
      actionKey: GettingStartedStepActionKey.HANDOVER_DEALS,
      kind: GettingStartedStepKind.WORKFLOW,
      title: 'Hand over won deals',
      doneTitle: 'Handover ready',
      description: 'Start the handover when a deal is won.',
      doneDescription:
        'Turn it on and won deals move to delivery on their own.',
      icon: 'IconSettingsAutomation',
      iconColor: 'gray',
      promptLabel: null,
      prompt: null,
      doneChatThreadId: null,
    },
    {
      __typename: 'GettingStartedStepDefinition',
      actionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
      kind: GettingStartedStepKind.PROMPT,
      title: 'Follow up on closing deals',
      doneTitle: 'Deal follow-ups on track',
      description: 'An agent drafts a follow-up for every deal about to close.',
      doneDescription:
        'Each week, every deal about to close gets a follow-up draft.',
      icon: 'IconSparkles',
      iconColor: 'purple',
      promptLabel: 'Follow-up instructions',
      prompt:
        'Every Monday, draft a follow-up email for each deal closing in the next 30 days.',
      doneChatThreadId: null,
    },
  ];

export const mockGettingStartedStepActionKeys: GettingStartedStepActionKey[] =
  mockGettingStartedStepDefinitions.map(({ actionKey }) => actionKey);
