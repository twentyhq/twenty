import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { describe, expect, it } from 'vitest';

import { IDENTIFIERS } from 'src/constants/universal-identifiers';

describe('CompanyEnrich app installation', () => {
  it('installs in a disposable workspace without calling CompanyEnrich', async () => {
    const client = new MetadataApiClient();
    const result = await client.query({
      findManyApplications: { id: true, name: true, universalIdentifier: true },
    });
    expect(
      result.findManyApplications.some(
        (application: { universalIdentifier: string }) =>
          application.universalIdentifier === IDENTIFIERS.application,
      ),
    ).toBe(true);
  });
});
