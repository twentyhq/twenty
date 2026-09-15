import { describe, expect, it } from 'vitest';

import { normalizeApplicationAssets } from '@/sdk/define/application/utils/normalize-application-assets';
import { type ApplicationConfig } from '@/sdk/define/application/application-config';

const buildConfig = (config: Record<string, unknown>): ApplicationConfig =>
  config as unknown as ApplicationConfig;

describe('normalizeApplicationAssets', () => {
  it('keeps a bundled logo', () => {
    const result = normalizeApplicationAssets(
      buildConfig({ logo: 'public/logo.png' }),
    );

    expect(result.logo).toBe('public/logo.png');
    expect(result.warnings).toEqual([]);
  });

  it('warns and ignores an absolute logo', () => {
    const result = normalizeApplicationAssets(
      buildConfig({ logo: 'https://example.com/logo.png' }),
    );

    expect(result.logo).toBeUndefined();
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('external URL');
  });

  it('migrates a deprecated relative logoUrl with a warning', () => {
    const result = normalizeApplicationAssets(
      buildConfig({ logoUrl: 'public/logo.png' }),
    );

    expect(result.logo).toBe('public/logo.png');
    expect(result.warnings[0]).toContain('`logoUrl` is deprecated');
  });

  it('warns and ignores an absolute logoUrl', () => {
    const result = normalizeApplicationAssets(
      buildConfig({ logoUrl: 'https://example.com/logo.png' }),
    );

    expect(result.logo).toBeUndefined();
    expect(result.warnings[0]).toContain('external URL');
  });

  it('prefers logo over a deprecated logoUrl', () => {
    const result = normalizeApplicationAssets(
      buildConfig({
        logo: 'public/logo.png',
        logoUrl: 'public/old.png',
      }),
    );

    expect(result.logo).toBe('public/logo.png');
    expect(result.warnings).toEqual([]);
  });

  it('keeps galleryImages as-is', () => {
    const result = normalizeApplicationAssets(
      buildConfig({
        galleryImages: ['public/a.png', 'public/b.png'],
      }),
    );

    expect(result.galleryImages).toEqual(['public/a.png', 'public/b.png']);
    expect(result.warnings).toEqual([]);
  });

  it('migrates deprecated screenshots to galleryImages with a warning', () => {
    const result = normalizeApplicationAssets(
      buildConfig({ screenshots: ['public/a.png', 'public/b.png'] }),
    );

    expect(result.galleryImages).toEqual(['public/a.png', 'public/b.png']);
    expect(result.warnings[0]).toContain('`screenshots` is deprecated');
  });

  it('warns and drops absolute urls from gallery images', () => {
    const result = normalizeApplicationAssets(
      buildConfig({
        galleryImages: ['public/a.png', 'https://example.com/b.png'],
      }),
    );

    expect(result.galleryImages).toEqual(['public/a.png']);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('external URL');
  });

  it('returns an empty gallery when nothing is provided', () => {
    const result = normalizeApplicationAssets(buildConfig({}));

    expect(result.logo).toBeUndefined();
    expect(result.galleryImages).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
});
