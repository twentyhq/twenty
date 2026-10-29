import { sortApplicationsWithOAuthOnlyLast } from '@/settings/applications/utils/sortApplicationsWithOAuthOnlyLast';
import { isDefined } from 'twenty-shared/utils';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

const buildApplication = (
  id: string,
  sourceType?: ApplicationRegistrationSourceType,
) => ({
  id,
  applicationRegistration: isDefined(sourceType) ? { sourceType } : null,
});

describe('sortApplicationsWithOAuthOnlyLast', () => {
  it('moves OAuth-only applications last and keeps the other order', () => {
    const applications = [
      buildApplication('zapier', ApplicationRegistrationSourceType.OAUTH_ONLY),
      buildApplication('acme', ApplicationRegistrationSourceType.NPM),
      buildApplication('standard'),
      buildApplication('make', ApplicationRegistrationSourceType.OAUTH_ONLY),
    ];

    expect(
      sortApplicationsWithOAuthOnlyLast(applications).map(({ id }) => id),
    ).toEqual(['acme', 'standard', 'zapier', 'make']);
  });

  it('does not reorder the given applications', () => {
    const applications = [
      buildApplication('zapier', ApplicationRegistrationSourceType.OAUTH_ONLY),
      buildApplication('acme', ApplicationRegistrationSourceType.NPM),
    ];

    sortApplicationsWithOAuthOnlyLast(applications);

    expect(applications.map(({ id }) => id)).toEqual(['zapier', 'acme']);
  });
});
