import { MetadataReadability } from 'twenty-shared/types';

import { parseDiscoverRestRequest } from 'src/engine/api/rest/input-request-parsers/discover-parser-utils/parse-discover-rest-request.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const buildRequest = (query: Record<string, string>) =>
  ({ query }) as unknown as AuthenticatedRequest;

const buildObjectMetadata = (readability: MetadataReadability) =>
  ({
    namePlural: 'notes',
    readability,
    discoverableFieldUniversalIdentifiers: null,
  }) as FlatObjectMetadata;

describe('parseDiscoverRestRequest', () => {
  const discoverableObject = buildObjectMetadata(
    MetadataReadability.DISCOVERABLE,
  );

  it('reads content when discover is absent or false', () => {
    expect(
      parseDiscoverRestRequest(buildRequest({}), discoverableObject),
    ).toBeUndefined();
    expect(
      parseDiscoverRestRequest(
        buildRequest({ discover: 'false' }),
        discoverableObject,
      ),
    ).toBe('content');
  });

  it('reads existence when discover is true on a discoverable object', () => {
    expect(
      parseDiscoverRestRequest(
        buildRequest({ discover: 'true' }),
        discoverableObject,
      ),
    ).toBe('existence');
  });

  it('rejects values other than true and false', () => {
    expect(() =>
      parseDiscoverRestRequest(
        buildRequest({ discover: 'yes' }),
        discoverableObject,
      ),
    ).toThrow("'discover=yes' parameter invalid");
  });

  it('rejects discover on an object whose records cannot be discovered', () => {
    for (const discover of ['true', 'false']) {
      expect(() =>
        parseDiscoverRestRequest(
          buildRequest({ discover }),
          buildObjectMetadata(MetadataReadability.PRIVATE),
        ),
      ).toThrow("'discover' parameter is only available");
    }
  });
});
