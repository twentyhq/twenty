import { runManifestBuild } from '@/cli/utilities/build/manifest/manifest-build';
import { join } from 'path';

import expectedManifest from './manifest.expected.json';

const APP_PATH = join(__dirname, '..');

describe('rich-app manifest', () => {
  it('should build manifest matching expected JSON', async () => {
    const manifest = await runManifestBuild(APP_PATH, {
      display: false,
      writeOutput: false,
    });

    expect(manifest).not.toBeNull();

    const { sources: _sources, ...sanitizedManifest } = {
      ...manifest,
      packageJson: {
        name: manifest!.packageJson.name,
      },
    };

    expect(sanitizedManifest).toEqual(expectedManifest);
  });

  it('should have correct application config', async () => {
    const manifest = await runManifestBuild(APP_PATH, {
      display: false,
      writeOutput: false,
    });

    expect(manifest?.application.displayName).toBe('Hello World');
    expect(manifest?.application.description).toBe('A simple hello world app');
  });

  it('should load all entity types', async () => {
    const manifest = await runManifestBuild(APP_PATH, {
      display: false,
      writeOutput: false,
    });

    expect(manifest?.objects).toHaveLength(2);
    expect(manifest?.serverlessFunctions).toHaveLength(4);
    expect(manifest?.frontComponents).toHaveLength(4);
    expect(manifest?.roles).toHaveLength(2);
    expect(manifest?.objectExtensions).toHaveLength(1);
  });
});
