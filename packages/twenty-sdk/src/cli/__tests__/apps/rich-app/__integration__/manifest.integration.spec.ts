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

    // Remove dynamic parts that change between runs
    const sanitizedManifest = {
      ...manifest,
      // Keep packageJson but remove version if it changes
      packageJson: {
        name: manifest!.packageJson.name,
      },
      // Remove sources as they contain full file contents
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

    // Objects: root.object.ts + objects/postCard.object.ts
    expect(manifest?.objects).toHaveLength(2);

    // Functions: root.function.ts + functions/*.function.ts (3)
    expect(manifest?.serverlessFunctions).toHaveLength(4);

    // Front components: root.front-component.tsx + components/*.front-component.tsx (3)
    expect(manifest?.frontComponents).toHaveLength(4);

    // Roles: root.role.ts + roles/default-function.role.ts
    expect(manifest?.roles).toHaveLength(2);

    // Object extensions: objects/postCard.object-extension.ts
    expect(manifest?.objectExtensions).toHaveLength(1);
  });
});
