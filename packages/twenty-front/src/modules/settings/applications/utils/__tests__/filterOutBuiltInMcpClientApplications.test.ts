import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { filterOutBuiltInMcpClientApplications } from '@/settings/applications/utils/filterOutBuiltInMcpClientApplications';
import { WellKnownOAuthClient } from '~/generated-metadata/graphql';

const buildApplication = ({
  id,
  wellKnownOAuthClient,
}: {
  id: string;
  wellKnownOAuthClient: WellKnownOAuthClient | null;
}) => ({
  id,
  applicationRegistration: { wellKnownOAuthClient },
});

const APPLICATIONS = [
  buildApplication({
    id: 'claude',
    wellKnownOAuthClient: WellKnownOAuthClient.CLAUDE,
  }),
  buildApplication({
    id: 'chatgpt',
    wellKnownOAuthClient: WellKnownOAuthClient.CHATGPT,
  }),
  buildApplication({ id: 'zapier', wellKnownOAuthClient: null }),
  { id: 'standard', applicationRegistration: null },
];

describe('filterOutBuiltInMcpClientApplications', () => {
  it('hides the apps the server identifies as a built-in MCP client app', () => {
    expect(
      filterOutBuiltInMcpClientApplications({
        applications: APPLICATIONS,
        builtInMcpClientApps: BUILT_IN_MCP_CLIENT_APPS,
      }).map(({ id }) => id),
    ).toEqual(['zapier', 'standard']);
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
