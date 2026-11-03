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
      title: 'Connect your mailbox',
      doneTitle: 'Mailbox connected',
      description:
        'Companies and people fill in from your emails and meetings.',
      icon: 'IconAt',
      iconColor: 'blue',
      promptLabel: null,
      prompt: null,
    },
    {
      __typename: 'GettingStartedStepDefinition',
      actionKey: GettingStartedStepActionKey.IMPORT_DATA,
      kind: GettingStartedStepKind.CUSTOM,
      title: 'Import your data',
      doneTitle: 'Spreadsheet uploaded',
      description:
        'Bring your companies, contacts and deals from any CRM export.',
      icon: 'IconFileImport',
      iconColor: 'gray',
      promptLabel: null,
      prompt: null,
    },
    {
      __typename: 'GettingStartedStepDefinition',
      actionKey: GettingStartedStepActionKey.INSTALL_APP,
      kind: GettingStartedStepKind.CUSTOM,
      title: 'Install an app',
      doneTitle: 'App installed',
      description: 'Add tools to your workspace.',
      icon: 'IconApps',
      iconColor: 'turquoise',
      promptLabel: null,
      prompt: null,
    },
    {
      __typename: 'GettingStartedStepDefinition',
      actionKey: GettingStartedStepActionKey.INVITE_TEAM,
      kind: GettingStartedStepKind.CUSTOM,
      title: 'Invite your team',
      doneTitle: 'Invitations sent',
      description: 'Bring your team into Twenty.',
      icon: 'IconUsers',
      iconColor: 'orange',
      promptLabel: null,
      prompt: null,
    },
    {
      __typename: 'GettingStartedStepDefinition',
      actionKey: GettingStartedStepActionKey.HANDOVER_DEALS,
      kind: GettingStartedStepKind.WORKFLOW,
      title: 'Hand over won deals',
      doneTitle: 'Workflow enabled',
      description: 'Start the handover when a deal is won.',
      icon: 'IconSettingsAutomation',
      iconColor: 'gray',
      promptLabel: null,
      prompt: null,
    },
    {
      __typename: 'GettingStartedStepDefinition',
      actionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
      kind: GettingStartedStepKind.PROMPT,
      title: 'Follow up on closing deals',
      doneTitle: 'Follow-up request sent',
      description: 'An agent drafts a follow-up for every deal about to close.',
      icon: 'IconSparkles',
      iconColor: 'purple',
      promptLabel: 'Follow-up instructions',
      prompt:
        'Every Monday, draft a follow-up email for each deal closing in the next 30 days.',
    },
  ];

export const mockGettingStartedStepActionKeys: GettingStartedStepActionKey[] =
  mockGettingStartedStepDefinitions.map(({ actionKey }) => actionKey);
