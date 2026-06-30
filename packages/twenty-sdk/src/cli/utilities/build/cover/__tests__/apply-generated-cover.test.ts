import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { applyGeneratedCover } from '@/cli/utilities/build/cover/apply-generated-cover';
import { generateCoverImage } from '@/cli/utilities/build/cover/generate-cover-image';
import { GENERATED_COVER_PATH } from '@/cli/utilities/build/cover/generated-cover-path';

vi.mock('@/cli/utilities/build/cover/generate-cover-image');

const mockedGenerateCoverImage = vi.mocked(generateCoverImage);

const COVER_BUFFER = Buffer.from('generated-cover');

const buildManifest = (
  application: Record<string, unknown>,
  publicAssets: Manifest['publicAssets'] = [],
): Manifest =>
  ({
    application,
    publicAssets,
  }) as unknown as Manifest;

describe('applyGeneratedCover', () => {
  let appPath: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockedGenerateCoverImage.mockResolvedValue(COVER_BUFFER);
    appPath = await mkdtemp(join(tmpdir(), 'cover-test-'));
  });

  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  const writeLogo = async (relativePath: string) => {
    await mkdir(join(appPath, 'public'), { recursive: true });
    await writeFile(join(appPath, relativePath), Buffer.from('logo'));
  };

  it('generates a cover when a local logo exists and no screenshots are set', async () => {
    await writeLogo('public/logo.png');
    const manifest = buildManifest({ logoUrl: 'public/logo.png' });

    const result = await applyGeneratedCover({ appPath, manifest });

    expect(mockedGenerateCoverImage).toHaveBeenCalledTimes(1);
    expect(result.manifest.application.screenshots).toEqual([
      GENERATED_COVER_PATH,
    ]);
    expect(
      result.manifest.publicAssets.some(
        (asset) => asset.filePath === GENERATED_COVER_PATH,
      ),
    ).toBe(true);
    expect(result.generatedAssets).toEqual([
      { relativePath: GENERATED_COVER_PATH, content: COVER_BUFFER },
    ]);
  });

  it('does nothing when there is no logo', async () => {
    const manifest = buildManifest({});

    const result = await applyGeneratedCover({ appPath, manifest });

    expect(mockedGenerateCoverImage).not.toHaveBeenCalled();
    expect(result.generatedAssets).toEqual([]);
    expect(result.manifest.application.screenshots).toBeUndefined();
  });

  it('does nothing when screenshots are already provided', async () => {
    await writeLogo('public/logo.png');
    const manifest = buildManifest({
      logoUrl: 'public/logo.png',
      screenshots: ['public/shot.png'],
    });

    const result = await applyGeneratedCover({ appPath, manifest });

    expect(mockedGenerateCoverImage).not.toHaveBeenCalled();
    expect(result.generatedAssets).toEqual([]);
    expect(result.manifest.application.screenshots).toEqual([
      'public/shot.png',
    ]);
  });

  it('does nothing when the logo is an absolute url', async () => {
    const manifest = buildManifest({
      logoUrl: 'https://example.com/logo.png',
    });

    const result = await applyGeneratedCover({ appPath, manifest });

    expect(mockedGenerateCoverImage).not.toHaveBeenCalled();
    expect(result.generatedAssets).toEqual([]);
  });

  it('does nothing when the logo file is missing', async () => {
    const manifest = buildManifest({ logoUrl: 'public/missing.png' });

    const result = await applyGeneratedCover({ appPath, manifest });

    expect(mockedGenerateCoverImage).not.toHaveBeenCalled();
    expect(result.generatedAssets).toEqual([]);
  });
});
