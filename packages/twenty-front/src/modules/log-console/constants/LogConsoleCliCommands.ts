import { msg } from '@lingui/core/macro';

export const LOG_CONSOLE_CLI_COMMANDS = [
  {
    command: 'auth login',
    description: msg`Sign in with your browser or an API key`,
  },
  {
    command: 'auth status',
    description: msg`Show which workspace commands use`,
  },
  {
    command: 'metadata object list',
    description: msg`List objects and who owns each one`,
  },
  {
    command: 'metadata field list <object>',
    description: msg`List the fields of an object`,
  },
  {
    command: 'data list <object>',
    description: msg`List records with filters and pagination`,
  },
  {
    command: 'data get <object> <id>',
    description: msg`Inspect a record by id`,
  },
  {
    command: 'api rest <path>',
    description: msg`Send a request to the REST API`,
  },
  {
    command: 'api graphql',
    description: msg`Send a GraphQL query or mutation`,
  },
  {
    command: 'open',
    description: msg`Open the workspace in your browser`,
  },
  {
    command: 'app init <name>',
    description: msg`Create an app from the template`,
  },
  {
    command: 'app dev',
    description: msg`Sync app changes to the workspace as you code`,
  },
  {
    command: 'app logs',
    description: msg`Watch logic function logs from this app`,
  },
  {
    command: 'doctor',
    description: msg`Diagnose CLI and workspace connection problems`,
  },
];
