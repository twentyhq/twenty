import { type Manifest } from 'twenty-shared/application';

import { resolveManifestAssetUrls } from 'src/engine/core-modules/application/application-marketplace/utils/resolve-manifest-asset-urls.util';

const buildMinimalManifest = (
  overrides: Partial<Manifest['application']> = {},
): Manifest => ({
  application: {
    universalIdentifier: 'app-1',
    defaultRoleUniversalIdentifier: 'role-1',
    displayName: 'Test App',
    description: 'A test app',
    packageJsonChecksum: null,
    yarnLockChecksum: null,
    ...overrides,
  },
  objects: [],
  fields: [],
  logicFunctions: [],
  frontComponents: [],
  roles: [],
  skills: [],
  agents: [],
  publicAssets: [],
  views: [],
  navigationMenuItems: [],
  pageLayouts: [],
  pageLayoutTabs: [],
  commandMenuItems: [],
});

describe('resolveManifestAssetUrls', () => {
  const urlBuilder = (filePath: string) =>
    `https://cdn.example.com/pkg/${filePath}`;

  it('should resolve a relative logoUrl', () => {
    const manifest = buildMinimalManifest({ logoUrl: 'logo.png' });

    const result = resolveManifestAssetUrls(manifest, urlBuilder);

    expect(result.application.logoUrl).toBe(
      'https://cdn.example.com/pkg/logo.png',
    );
  });

  it('should not modify an absolute logoUrl', () => {
    const manifest = buildMinimalManifest({
      logoUrl: 'https://example.com/logo.png',
    });

    const result = resolveManifestAssetUrls(manifest, urlBuilder);

    expect(result.application.logoUrl).toBe('https://example.com/logo.png');
  });

  it('should not modify an http logoUrl', () => {
    const manifest = buildMinimalManifest({
      logoUrl: 'http://example.com/logo.png',
    });

    const result = resolveManifestAssetUrls(manifest, urlBuilder);

    expect(result.application.logoUrl).toBe('http://example.com/logo.png');
  });

  it('should leave logoUrl undefined when not set', () => {
    const manifest = buildMinimalManifest();

    const result = resolveManifestAssetUrls(manifest, urlBuilder);

    expect(result.application.logoUrl).toBeUndefined();
  });

  it('should resolve relative screenshot paths', () => {
    const manifest = buildMinimalManifest({
      screenshots: ['screen1.png', 'screen2.png'],
    });

    const result = resolveManifestAssetUrls(manifest, urlBuilder);

    expect(result.application.screenshots).toEqual([
      'https://cdn.example.com/pkg/screen1.png',
      'https://cdn.example.com/pkg/screen2.png',
    ]);
  });

  it('should not modify absolute screenshot URLs', () => {
    const manifest = buildMinimalManifest({
      screenshots: [
        'https://example.com/screen1.png',
        'https://example.com/screen2.png',
      ],
    });

    const result = resolveManifestAssetUrls(manifest, urlBuilder);

    expect(result.application.screenshots).toEqual([
      'https://example.com/screen1.png',
      'https://example.com/screen2.png',
    ]);
  });

  it('should handle a mix of relative and absolute screenshot URLs', () => {
    const manifest = buildMinimalManifest({
      screenshots: ['relative.png', 'https://example.com/absolute.png'],
    });

    const result = resolveManifestAssetUrls(manifest, urlBuilder);

    expect(result.application.screenshots).toEqual([
      'https://cdn.example.com/pkg/relative.png',
      'https://example.com/absolute.png',
    ]);
  });

  it('should handle empty screenshots array', () => {
    const manifest = buildMinimalManifest({ screenshots: [] });

    const result = resolveManifestAssetUrls(manifest, urlBuilder);

    expect(result.application.screenshots).toEqual([]);
  });

  it('should handle undefined screenshots', () => {
    const manifest = buildMinimalManifest();

    const result = resolveManifestAssetUrls(manifest, urlBuilder);

    expect(result.application.screenshots).toEqual([]);
  });

  it('should preserve all other manifest properties', () => {
    const manifest = buildMinimalManifest({
      logoUrl: 'logo.png',
      author: 'Test Author',
      websiteUrl: 'https://test.com',
    });
    manifest.objects = [{ universalIdentifier: 'obj-1' } as never];

    const result = resolveManifestAssetUrls(manifest, urlBuilder);

    expect(result.application.author).toBe('Test Author');
    expect(result.application.websiteUrl).toBe('https://test.com');
    expect(result.application.displayName).toBe('Test App');
    expect(result.objects).toEqual([{ universalIdentifier: 'obj-1' }]);
  });
});
