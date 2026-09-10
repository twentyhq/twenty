import { buildPublicAssetLogoUrl } from 'src/engine/core-modules/application/utils/build-public-asset-logo-url.util';

const BASE_ARGS = {
  serverUrl: 'https://crm.example.com',
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  applicationId: '5f3e1b9a-1c25-4d02-bf25-6aeccf7ea420',
};

describe('buildPublicAssetLogoUrl', () => {
  it.each([[null], [undefined], ['']])(
    'returns null when the logo is %p',
    (logo) => {
      expect(buildPublicAssetLogoUrl({ ...BASE_ARGS, logo })).toBeNull();
    },
  );

  it('returns the logo untouched when it is already an absolute url', () => {
    expect(
      buildPublicAssetLogoUrl({
        ...BASE_ARGS,
        logo: 'https://cdn.example.com/logo.svg',
      }),
    ).toBe('https://cdn.example.com/logo.svg');
  });

  it('builds a public-assets url from an application-relative path', () => {
    expect(
      buildPublicAssetLogoUrl({ ...BASE_ARGS, logo: 'public/logo.svg' }),
    ).toBe(
      `https://crm.example.com/public-assets/${BASE_ARGS.workspaceId}/${BASE_ARGS.applicationId}/public/logo.svg`,
    );
  });
});
