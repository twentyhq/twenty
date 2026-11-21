import { getApplicationsWithConnectedMembersDescription } from '@/settings/applications/utils/getApplicationsWithConnectedMembersDescription';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

const buildApplication = ({
  id,
  sourceType,
}: {
  id: string;
  sourceType: ApplicationRegistrationSourceType;
}) => ({
  id,
  name: id,
  description: 'Stored description',
  universalIdentifier: id,
  version: '1.0.0',
  applicationRegistration: { id: `${id}-registration`, sourceType },
});

describe('getApplicationsWithConnectedMembersDescription', () => {
  it('describes an OAuth-only app by how many members connected it', () => {
    const [connectedByTwo, connectedByOne, connectedByNone] =
      getApplicationsWithConnectedMembersDescription({
        applications: ['first', 'second', 'third'].map((id) =>
          buildApplication({
            id,
            sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
          }),
        ),
        applicationAuthorizations: [
          { applicationId: 'first' },
          { applicationId: 'first' },
          { applicationId: 'second' },
        ],
      });

    expect(connectedByTwo.description).toBe('Connected by 2 members');
    expect(connectedByOne.description).toBe('Connected by 1 member');
    expect(connectedByNone.description).toBe('No members connected');
  });

  it('keeps the description of an installed app', () => {
    const [application] = getApplicationsWithConnectedMembersDescription({
      applications: [
        buildApplication({
          id: 'installed',
          sourceType: ApplicationRegistrationSourceType.NPM,
        }),
      ],
      applicationAuthorizations: [{ applicationId: 'installed' }],
    });

    expect(application.description).toBe('Stored description');
  });
});
