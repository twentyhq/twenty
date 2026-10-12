import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const AUTH_STATUS_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['auth', 'status'],
  description: 'Show which workspace commands use and check its credentials',
  outputModes: ['human', 'json'],
  writes: false,
  needsProject: false,
  needsTarget: true,
  load: async () =>
    (await import('@/commands/auth/status/run-auth-status-command'))
      .runAuthStatusCommand,
};
