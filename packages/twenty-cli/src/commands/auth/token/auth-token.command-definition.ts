import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const AUTH_TOKEN_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['auth', 'token'],
  description: 'Print the credential commands send, for scripts',
  examples: [
    'curl -H "Authorization: Bearer $(twenty auth token)" https://acme.twenty.com/rest/companies',
  ],
  outputModes: ['human', 'json'],
  writes: false,
  needsProject: false,
  needsTarget: true,
  load: async () =>
    (await import('@/commands/auth/token/run-auth-token-command'))
      .runAuthTokenCommand,
};
