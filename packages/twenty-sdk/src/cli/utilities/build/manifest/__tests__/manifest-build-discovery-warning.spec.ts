import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';

const createAppDir = async (): Promise<string> => {
  return mkdtemp(join(tmpdir(), 'twenty-manifest-discovery-'));
};

describe('buildManifest entity discovery warnings', () => {
  it('warns when a file calls a define function but no entity is discovered', async () => {
    const appDir = await createAppDir();

    await writeFile(
      join(appDir, 'broken.front-component.tsx'),
      `
        import { defineFrontComponent } from 'twenty-sdk/define';

        const Component = () => <div>hello</div>;

        const config = defineFrontComponent({
          universalIdentifier: 'a7c1b9a0-0000-0000-0000-000000000000',
          name: 'broken',
          component: Component,
        });

        export { config };
      `,
    );

    const { warnings } = await buildManifest(appDir);

    expect(warnings).toEqual([
      expect.stringContaining('broken.front-component.tsx'),
    ]);
    expect(warnings[0]).toContain('defineFrontComponent');
  });

  it('does not warn for files that reference no define function', async () => {
    const appDir = await createAppDir();

    await writeFile(
      join(appDir, 'helper.ts'),
      `export const formatLabel = (label: string) => label.trim();`,
    );

    const { warnings } = await buildManifest(appDir);

    expect(warnings).toEqual([]);
  });
});
