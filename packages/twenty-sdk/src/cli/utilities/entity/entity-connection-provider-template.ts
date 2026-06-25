import { kebabCase } from '@/cli/utilities/string/kebab-case';
import { v4 } from 'uuid';

export const getConnectionProviderBaseFile = ({
  name,
  universalIdentifier = v4(),
}: {
  name: string;
  universalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);
  const upperKey = kebabCaseName.toUpperCase().replace(/-/g, '_');
  // Escape backslashes and single quotes so a name like "Bob's app" produces
  // a valid TS literal in the generated file.
  const escapedDisplayName = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  return `import { defineConnectionProvider } from 'twenty-sdk/define';

export const ${upperKey}_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER =
  '${universalIdentifier}';

export default defineConnectionProvider({
  universalIdentifier: ${upperKey}_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: '${kebabCaseName}',
  displayName: '${escapedDisplayName}',
  type: 'oauth',
  oauth: {
    // Replace with the OAuth provider's endpoints.
    authorizationEndpoint: 'https://example.com/oauth/authorize',
    tokenEndpoint: 'https://example.com/oauth/access_token',
    scopes: [],
    // Names of serverVariables declared on this app's defineApplication.
    clientIdVariable: '${upperKey}_CLIENT_ID',
    clientSecretVariable: '${upperKey}_CLIENT_SECRET',
  },
});
`;
};
