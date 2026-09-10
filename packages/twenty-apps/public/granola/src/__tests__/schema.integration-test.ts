import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { describe, expect, it } from 'vitest';

describe('Granola installation', () => {
  it('installs the application with its reserved identity', async () => {
    const result = await new MetadataApiClient().query({
      findManyApplications: { id: true, universalIdentifier: true },
    });
    expect(
      result.findManyApplications.some(
        (application) =>
          application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
      ),
    ).toBe(true);
  });
});
