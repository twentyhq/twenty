import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getFrontComponentUrl } from '@/front-components/utils/getFrontComponentUrl';

describe('getFrontComponentUrl', () => {
  it('builds a checksum-fingerprinted path URL when a checksum is provided', () => {
    expect(
      getFrontComponentUrl({
        frontComponentId: 'front-component-id',
        checksum: 'abc123',
      }),
    ).toBe(
      `${REST_API_BASE_URL}/front-components/front-component-id/abc123.js`,
    );
  });

  it('falls back to the bare id URL when no checksum is provided', () => {
    expect(
      getFrontComponentUrl({ frontComponentId: 'front-component-id' }),
    ).toBe(`${REST_API_BASE_URL}/front-components/front-component-id`);
  });
});
