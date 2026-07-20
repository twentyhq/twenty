import { getFindAllViewsCacheTtl } from 'src/engine/api/graphql/graphql-config/utils/get-find-all-views-cache-ttl.util';

describe('getFindAllViewsCacheTtl', () => {
  it.each([
    { configuredTtl: 0, expectedTtl: 3_600_000 },
    { configuredTtl: 60_000, expectedTtl: 60_000 },
    { configuredTtl: 7_200_000, expectedTtl: 3_600_000 },
  ])(
    'returns $expectedTtl when the configured TTL is $configuredTtl',
    ({ configuredTtl, expectedTtl }) => {
      expect(getFindAllViewsCacheTtl(configuredTtl)).toBe(expectedTtl);
    },
  );
});
