import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { getFingerprintedRestUrl } from '@/front-components/utils/getFingerprintedRestUrl';

describe('getFingerprintedRestUrl', () => {
  it.each(['front-components', 'front-component-shared-dependencies'] as const)(
    'keeps %s checksums outside static asset paths',
    (resource) => {
      expect(
        getFingerprintedRestUrl({
          resource,
          id: 'resource-id',
          checksum: 'abc123',
        }),
      ).toBe(`${REST_API_BASE_URL}/${resource}/resource-id/abc123`);
    },
  );

  it('falls back to the bare id URL when no checksum is provided', () => {
    expect(
      getFingerprintedRestUrl({
        resource: 'front-component-shared-dependencies',
        id: 'application-id',
      }),
    ).toBe(
      `${REST_API_BASE_URL}/front-component-shared-dependencies/application-id`,
    );
  });
});
