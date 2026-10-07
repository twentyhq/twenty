import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const AUTH_LOGOUT_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['auth', 'logout'],
  description: 'Forget the credentials of a saved remote, keeping the remote',
  examples: ['twenty auth logout --remote staging'],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: false,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/auth/logout/run-auth-logout-command'))
      .runAuthLogoutCommand,
};
