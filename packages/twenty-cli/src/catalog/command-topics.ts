import { HELP_GROUP } from '@/catalog/constants/help-group.constant';
import { type CommandTopicDefinition } from '@/catalog/types/command-topic-definition.type';

export const COMMAND_TOPICS: CommandTopicDefinition[] = [
  {
    path: ['app'],
    description: 'Create, develop and manage applications',
    helpGroup: HELP_GROUP.APP,
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
