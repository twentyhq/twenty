import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const API_GRAPHQL_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['api', 'graphql'],
  description: 'Send a GraphQL query or mutation',
  options: [
    {
      flags: '--query <query>',
      description:
        'GraphQL document: inline, @file.graphql, or - for standard input',
      required: true,
    },
    {
      flags: '--variables <json>',
      description:
        'Variables as a JSON object: inline, @file.json, or - for standard input',
    },
    {
      flags: '--metadata',
      description: 'Send to the metadata API instead of the core API',
    },
  ],
  examples: [
    "twenty api graphql --query '{ companies(first: 2) { edges { node { name } } } }'",
    "twenty api graphql --metadata --query '{ currentWorkspace { displayName } }'",
    'twenty api graphql --query @create-company.graphql --variables @variables.json',
  ],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: false,
  needsTarget: true,
  load: async () =>
    (await import('@/commands/api/graphql/run-api-graphql-command'))
      .runApiGraphqlCommand,
};
