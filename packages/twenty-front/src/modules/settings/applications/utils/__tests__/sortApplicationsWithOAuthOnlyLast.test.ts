import { sortApplicationsWithOAuthOnlyLast } from '@/settings/applications/utils/sortApplicationsWithOAuthOnlyLast';
import { isDefined } from 'twenty-shared/utils';
import {
  ApplicationRegistrationSourceType,
  type ApplicationRegistrationSummary,
} from '~/generated-metadata/graphql';

const buildApplication = ({
  id,
  sourceType,
}: { id: string } & Partial<
  Pick<ApplicationRegistrationSummary, 'sourceType'>
>) => ({
  id,
  applicationRegistration: isDefined(sourceType) ? { sourceType } : null,
});

describe('sortApplicationsWithOAuthOnlyLast', () => {
  it('moves OAuth-only applications last and keeps the other order', () => {
    const applications = [
      buildApplication({
        id: 'zapier',
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      }),
      buildApplication({
        id: 'acme',
        sourceType: ApplicationRegistrationSourceType.NPM,
      }),
      buildApplication({ id: 'standard' }),
      buildApplication({
        id: 'make',
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      }),
    ];

    expect(
      sortApplicationsWithOAuthOnlyLast(applications).map(({ id }) => id),
    ).toEqual(['acme', 'standard', 'zapier', 'make']);
  });

  it('does not reorder the given applications', () => {
    const applications = [
      buildApplication({
        id: 'zapier',
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      }),
      buildApplication({
        id: 'acme',
        sourceType: ApplicationRegistrationSourceType.NPM,
      }),
    ];

    sortApplicationsWithOAuthOnlyLast(applications);

    expect(applications.map(({ id }) => id)).toEqual(['zapier', 'acme']);
  });
});
