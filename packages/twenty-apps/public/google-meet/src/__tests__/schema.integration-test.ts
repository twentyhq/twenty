import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';
import { describe, expect, it } from 'vitest';

import {
  GOOGLE_MEET_PROVIDER_NAME,
  GOOGLE_MEET_READONLY_SCOPE,
  GOOGLE_MEET_USER_PROVIDER_NAME,
} from 'src/constants/google-meet.constant';
import {
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

describe('App installation', () => {
  it('registers workspace-shared and personal Google OAuth without configured credentials', async () => {
    const client = new MetadataApiClient();

    const { findManyApplications } = await client.query({
      findManyApplications: { id: true, universalIdentifier: true },
    });

    const application = findManyApplications.find(
      (application) =>
        application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    if (!isDefined(application)) {
      throw new Error('The Google Meet application was not installed.');
    }

    const { applicationConnectionProviders } = await client.query({
      applicationConnectionProviders: {
        __args: { applicationId: application.id },
        applicationId: true,
        name: true,
        displayName: true,
        type: true,
        scope: true,
        oauth: {
          scopes: true,
          isClientCredentialsConfigured: true,
        },
      },
    });

    const buildExpectedProvider = ({
      name,
      scope,
    }: {
      name: string;
      scope: 'USER' | 'WORKSPACE';
    }) => ({
      applicationId: application.id,
      name,
      displayName: APP_DISPLAY_NAME,
      type: 'oauth',
      scope,
      oauth: {
        scopes: expect.arrayContaining([GOOGLE_MEET_READONLY_SCOPE]),
        isClientCredentialsConfigured: false,
      },
    });

    expect(applicationConnectionProviders).toHaveLength(2);
    expect(applicationConnectionProviders).toEqual(
      expect.arrayContaining([
        buildExpectedProvider({
          name: GOOGLE_MEET_PROVIDER_NAME,
          scope: 'WORKSPACE',
        }),
        buildExpectedProvider({
          name: GOOGLE_MEET_USER_PROVIDER_NAME,
          scope: 'USER',
        }),
      ]),
    );
  });
});
