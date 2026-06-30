import { readdir } from 'node:fs/promises';
import { join } from 'path';
import { type Manifest, OUTPUT_DIR } from 'twenty-shared/application';

import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { EXPECTED_MANIFEST } from '@/cli/__tests__/apps/minimal-app/__integration__/app-dev/expected-manifest';
import { normalizeManifestForComparison } from '@/cli/__tests__/integration/utils/normalize-manifest.util';
import { appDevOnce, type AppDevOnceResult } from '@/cli/operations/dev-once';
import { type CommandResult } from '@/cli/types';
import { pathExists, readJson, remove } from '@/cli/utilities/file/fs-utils';

const OUTPUT_PATH = join(MINIMAL_APP_PATH, OUTPUT_DIR);
const MANIFEST_PATH = join(OUTPUT_PATH, 'manifest.json');

describe('minimal-app dev-once', () => {
  let result: CommandResult<AppDevOnceResult>;

  beforeAll(async () => {
    // Make sure we are starting from a clean slate so we know the
    // generated files come from this run, not a previous one.
    await remove(OUTPUT_PATH);

    result = await appDevOnce({ appPath: MINIMAL_APP_PATH });

    if (!result.success) {
      throw new Error(
        `appDevOnce did not succeed: ${result.error.code} - ${result.error.message}`,
      );
    }
  }, 60000);

  describe('result', () => {
    it('should return success', () => {
      expect(result.success).toBe(true);
    });

    it('should report the application display name from the manifest', () => {
      if (!result.success) {
        throw new Error('expected success');
      }

      expect(result.data.applicationDisplayName).toBe(
        EXPECTED_MANIFEST.application.displayName,
      );
    });

    it('should report the application universal identifier', () => {
      if (!result.success) {
        throw new Error('expected success');
      }

      expect(result.data.applicationUniversalIdentifier).toBe(
        EXPECTED_MANIFEST.application.universalIdentifier,
      );
    });

    it('should report a non-zero file count', () => {
      if (!result.success) {
        throw new Error('expected success');
      }

      expect(result.data.fileCount).toBeGreaterThan(0);
    });

    it('should report the output directory', () => {
      if (!result.success) {
        throw new Error('expected success');
      }

      expect(result.data.outputDir).toBe(OUTPUT_PATH);
    });
  });

  describe('manifest', () => {
    it('should have generated manifest.json', async () => {
      expect(await pathExists(MANIFEST_PATH)).toBe(true);
    });

    it('should write the same manifest content as `dev`', async () => {
      const manifest = normalizeManifestForComparison(
        await readJson<Manifest>(MANIFEST_PATH),
      );

      expect(manifest).toEqual(
        normalizeManifestForComparison(EXPECTED_MANIFEST),
      );
    });
  });

  describe('built files', () => {
    it('should have built the logic function', async () => {
      const files = (await readdir(OUTPUT_PATH, { recursive: true })).map(
        (file) => file.toString(),
      );

      expect(
        files.filter((file) => file.includes('.function.')).sort(),
      ).toEqual(['my.function.mjs', 'my.function.mjs.map']);
    });

    it('should have built the front component', async () => {
      const files = (await readdir(OUTPUT_PATH, { recursive: true })).map(
        (file) => file.toString(),
      );

      expect(
        files.filter((file) => file.includes('.front-component.')).sort(),
      ).toEqual(['my.front-component.mjs', 'my.front-component.mjs.map']);
    });
  });
});
