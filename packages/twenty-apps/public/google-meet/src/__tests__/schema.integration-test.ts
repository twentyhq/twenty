import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { describe, expect, it } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

describe('App installation', () => {
  it('installs the Google Meet application', async () => {
    const { findManyApplications } = await new MetadataApiClient().query({
      findManyApplications: { universalIdentifier: true },
    });

    expect(
      findManyApplications.map(
        (application) => application.universalIdentifier,
      ),
    ).toContain(APPLICATION_UNIVERSAL_IDENTIFIER);
  });
});
