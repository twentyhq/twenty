import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/roles/default-role';
import { defineApplication } from 'twenty-sdk';

export default defineApplication({
  universalIdentifier: '0fac8de4-9d11-492b-9e6a-577e11e1c442',
  displayName: 'Twenty for Twenty',
  description: '',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  applicationVariables: {
    CLICKHOUSE_URL: {
      universalIdentifier: 'b204304f-d3d3-4ae2-aafa-24b21c159181',
      description: 'The URL of the ClickHouse server, including the protocol and port (e.g., http://localhost:8123)',
      isSecret: true,
    },
    CLICKHOUSE_USERNAME: {
      universalIdentifier: '711e8ea8-8b19-4cf0-82ab-ab44417312bd',
      description: 'The username for authenticating with the ClickHouse server',
      isSecret: true,
    },
    CLICKHOUSE_PASSWORD: {
      universalIdentifier: 'faba7ed7-9f94-4202-944b-c25c683e9504',
      description: 'The password for authenticating with the ClickHouse server',
      isSecret: true,
    },
    CLICKHOUSE_DATABASE: {
      universalIdentifier: '3e6698fa-0c00-49e5-9c4d-34d5b177bff3',
      description: 'The name of the ClickHouse database to connect to',
      isSecret: true,
    },
  },
});
