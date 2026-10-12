import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';
import { REST_METHODS } from '@/commands/api/rest/constants/rest-methods.constant';

export const API_REST_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['api', 'rest'],
  description: 'Send a request to the REST API',
  arguments: [
    {
      name: 'path',
      description: 'Path under the API URL, for example /rest/companies',
      required: true,
    },
  ],
  options: [
    {
      flags: '-X, --method <method>',
      description: 'HTTP method, defaults to GET; required with --body',
      choices: REST_METHODS,
    },
    {
      flags: '--body <json>',
      description: 'Request body: JSON, @file.json, or - for standard input',
    },
  ],
  examples: [
    "twenty api rest '/rest/companies?limit=5'",
    'twenty api rest /rest/companies --method POST --body \'{"name":"Linear"}\'',
    'twenty api rest /rest/companies/<id> --method PATCH --body @changes.json',
  ],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: false,
  needsTarget: true,
  load: async () =>
    (await import('@/commands/api/rest/run-api-rest-command'))
      .runApiRestCommand,
};
