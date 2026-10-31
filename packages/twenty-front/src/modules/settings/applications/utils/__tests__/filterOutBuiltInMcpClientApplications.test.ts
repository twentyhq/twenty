import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { filterOutBuiltInMcpClientApplications } from '@/settings/applications/utils/filterOutBuiltInMcpClientApplications';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

const buildApplication = ({
  id,
  redirectUriHostnames,
  sourceType = ApplicationRegistrationSourceType.OAUTH_ONLY,
}: {
  id: string;
  redirectUriHostnames: string[];
  sourceType?: ApplicationRegistrationSourceType;
}) => ({
  id,
  applicationRegistration: { sourceType, redirectUriHostnames },
});

const APPLICATIONS = [
  buildApplication({ id: 'claude', redirectUriHostnames: ['claude.ai'] }),
  buildApplication({ id: 'chatgpt', redirectUriHostnames: ['chatgpt.com'] }),
  buildApplication({ id: 'zapier', redirectUriHostnames: ['zapier.com'] }),
  buildApplication({
    id: 'claims-claude',
    redirectUriHostnames: ['claude.ai', 'third-party.example'],
  }),
  buildApplication({
    id: 'npm-with-claude-callback',
    redirectUriHostnames: ['claude.ai'],
    sourceType: ApplicationRegistrationSourceType.NPM,
  }),
  { id: 'standard', applicationRegistration: null },
];

describe('filterOutBuiltInMcpClientApplications', () => {
  it('hides the OAuth apps whose callback hosts all belong to a built-in MCP client app', () => {
    expect(
      filterOutBuiltInMcpClientApplications({
        applications: APPLICATIONS,
        builtInMcpClientApps: BUILT_IN_MCP_CLIENT_APPS,
      }).map(({ id }) => id),
    ).toEqual([
      'zapier',
      'claims-claude',
      'npm-with-claude-callback',
      'standard',
    ]);
  });

  it('hides nothing without built-in MCP client apps', () => {
    expect(
      filterOutBuiltInMcpClientApplications({
        applications: APPLICATIONS,
        builtInMcpClientApps: [],
      }),
    ).toEqual(APPLICATIONS);
  });
});
