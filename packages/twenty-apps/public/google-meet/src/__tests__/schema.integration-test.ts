import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';
import { describe, expect, it } from 'vitest';

import {
  GOOGLE_MEET_READONLY_SCOPE,
  GOOGLE_MEET_USER_PROVIDER_NAME,
} from 'src/constants/google-meet.constant';
import {
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

describe('App installation', () => {
  it('registers only personal Google OAuth without configured credentials', async () => {
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

    expect(applicationConnectionProviders).toEqual([
      {
        applicationId: application.id,
        name: GOOGLE_MEET_USER_PROVIDER_NAME,
        displayName: APP_DISPLAY_NAME,
        type: 'oauth',
        scope: 'USER',
        oauth: {
          scopes: expect.arrayContaining([GOOGLE_MEET_READONLY_SCOPE]),
          isClientCredentialsConfigured: false,
        },
      },
    ]);
  });
});
