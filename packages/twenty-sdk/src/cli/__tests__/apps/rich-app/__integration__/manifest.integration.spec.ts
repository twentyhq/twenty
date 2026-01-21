import { runManifestBuild } from '@/cli/utilities/build/manifest/manifest-build';
import { join } from 'path';

const APP_PATH = join(__dirname, '..');

describe('rich-app manifest', () => {
  it('should build manifest matching snapshot', async () => {
    const manifest = await runManifestBuild(APP_PATH, {
      display: false,
      writeOutput: false,
    });

    expect(manifest).not.toBeNull();

    const sanitizedManifest = {
      ...manifest,
      packageJson: {
        name: manifest!.packageJson.name,
      },
      sources: undefined,
    };

    expect(sanitizedManifest).toMatchSnapshot();
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
