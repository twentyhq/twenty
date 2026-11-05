import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './no-miscased-acronym-in-identifier';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'export const makeGraphqlApiRequest = () => {};',
      filename: 'make-graphql-api-request.util.ts',
    },
    {
      code: 'export type SsoIdentityProvider = { issuer: string };',
      filename: 'sso-identity-provider.type.ts',
    },
    {
      code: "export const SSO_URL_PARAM = 'sso';",
      filename: 'sso.constant.ts',
    },
    {
      code: 'export class HTMLSanitizerService {}',
      filename: 'html-sanitizer.service.ts',
    },
    {
      code: "import { URLSearchParams } from 'node:url';\nconst params = new URLSearchParams();",
      filename: 'build-query.util.ts',
    },
    {
      code: 'const options = { baseURL: url };',
      filename: 'client.factory.ts',
    },
    {
      code: 'class SsoIdentityProvider { @Column() ssoURL: string; }',
      filename: 'sso-identity-provider.entity.ts',
    },
    {
      code: "export const RECALL_API_MAX_ATTEMPTS = 3;",
      filename:
        'packages/twenty-apps/public/companion/src/logic-functions/constants/RECALL_API_MAX_ATTEMPTS.ts',
    },
    {
      code: 'export const GET_AUTHORIZATION_URL_FOR_SSO = gql``;',
      filename:
        'packages/twenty-front/src/modules/auth/graphql/mutations/getAuthorizationUrlForSSO.ts',
    },
    {
      code: 'class SsoResolver { @Mutation(() => SetupSsoDTO) async createOIDCIdentityProvider() {} }',
      filename: 'sso.resolver.ts',
    },
    {
      code: 'class SsoResolver { @Query(() => [FindAvailableSsoIdpDTO]) async getSSOIdentityProviders() {} }',
      filename: 'sso.resolver.ts',
    },
  ],
  invalid: [
    {
      code: 'export const makeGraphqlAPIRequest = () => {};',
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'make-graphql-api-request.util.ts',
    },
    {
      code: 'export function openAPIReference() {}',
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'open-api-reference.ts',
    },
    {
      code: 'export class SSOIdentityProviderService {}',
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'sso-identity-provider.service.ts',
    },
    {
      code: 'export type URLDisplayProps = { value: string };',
      errors: [
        { messageId: 'miscasedAcronymInFilename' },
        { messageId: 'miscasedAcronym' },
      ],
      filename: 'URLDisplay.tsx',
    },
    {
      code: 'export interface SAMLIdentityProvider { issuer: string }',
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'saml-identity-provider.type.ts',
    },
    {
      code: 'export enum OIDCScopeValues { Email }',
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'oidc-scope-values.enum.ts',
    },
    {
      code: 'class SsoService { getSSOIdentityProviders() {} }',
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'sso.service.ts',
    },
    {
      code: 'export const openApiReference = {};',
      errors: [{ messageId: 'miscasedAcronymInFilename' }],
      filename: 'packages/twenty-server/src/engine/core-modules/open-api/openAPIReference.ts',
    },
    {
      code: 'export const SettingsSsoForm = () => null;',
      errors: [{ messageId: 'miscasedAcronymInFilename' }],
      filename:
        'packages/twenty-front/src/modules/settings/security/components/SettingsSSOForm.tsx',
    },
    {
      code: 'export type SAMLSSOInput = { issuer: string };',
      errors: [{ messageId: 'miscasedAcronym' }],
      filename: 'saml-sso-input.type.ts',
    },
  ],
});
