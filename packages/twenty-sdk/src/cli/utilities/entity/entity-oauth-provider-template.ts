import { kebabCase } from '@/cli/utilities/string/kebab-case';
import { v4 } from 'uuid';

export const getOAuthProviderBaseFile = ({
  name,
  universalIdentifier = v4(),
}: {
  name: string;
  universalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);
  const upperKey = kebabCaseName.toUpperCase().replace(/-/g, '_');

  return `import { defineOAuthProvider } from 'twenty-sdk/define';

export const ${upperKey}_OAUTH_PROVIDER_UNIVERSAL_IDENTIFIER =
  '${universalIdentifier}';

export default defineOAuthProvider({
  universalIdentifier: ${upperKey}_OAUTH_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: '${kebabCaseName}',
  displayName: '${name}',
  // Replace with the OAuth provider's endpoints.
  authorizationEndpoint: 'https://example.com/oauth/authorize',
  tokenEndpoint: 'https://example.com/oauth/access_token',
  scopes: [],
  // Reference applicationVariables declared on this app's defineApplication.
  clientIdVariable: '${upperKey}_CLIENT_ID',
  clientSecretVariable: '${upperKey}_CLIENT_SECRET',
});
`;
};
