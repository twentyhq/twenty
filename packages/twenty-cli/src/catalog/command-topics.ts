import { HELP_GROUP } from '@/catalog/constants/help-group.constant';
import { type CommandTopicDefinition } from '@/catalog/types/command-topic-definition.type';

export const COMMAND_TOPICS: CommandTopicDefinition[] = [
  {
    path: ['app'],
    description: 'Create, develop and manage applications',
    helpGroup: HELP_GROUP.APP,
  },
  {
    path: ['app', 'translations'],
    description: 'Manage app translation catalogs',
  },
  {
    path: ['data'],
    description: 'Read workspace records',
    helpGroup: HELP_GROUP.WORKSPACE,
  },
  {
    path: ['auth'],
    description: 'Sign in and manage credentials',
    helpGroup: HELP_GROUP.WORKSPACE,
  },
  {
    path: ['remote'],
    description: 'Manage saved workspace connections',
    helpGroup: HELP_GROUP.WORKSPACE,
    helpText: [
      '',
      'Add a remote with twenty auth login, using browser sign-in or an API key.',
      '',
      'Browser sign-in:',
      '  twenty auth login --url http://localhost:2020 --name local --use',
      '',
      'API key (from the TWENTY_API_KEY environment variable):',
      '  printf \'%s\' "$TWENTY_API_KEY" | twenty auth login --with-token \\',
      '    --url http://localhost:2020 --name local --use',
      '',
      '--name sets the remote name; --use makes it the default.',
      'See twenty auth login --help for all options.',
      '',
    ].join('\n'),
  },
  {
    path: ['metadata'],
    description: 'Inspect the data model',
    helpGroup: HELP_GROUP.WORKSPACE,
  },
  {
    path: ['metadata', 'object'],
    description: 'Objects',
  },
  {
    path: ['metadata', 'field'],
    description: 'Fields',
  },
  {
    path: ['api'],
    description: 'Send raw REST and GraphQL requests',
    helpGroup: HELP_GROUP.WORKSPACE,
  },
];
