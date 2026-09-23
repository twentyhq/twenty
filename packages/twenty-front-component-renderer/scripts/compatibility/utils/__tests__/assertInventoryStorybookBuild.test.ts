import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { assertInventoryStorybookBuild } from '../assertInventoryStorybookBuild';

const STORY_IDS = [
  'frontcomponent-worker-platform-apis--compatibility-inventory-react',
  'frontcomponent-worker-platform-apis--compatibility-inventory-preact',
];

describe('assertInventoryStorybookBuild', () => {
  let directory: string;

  const writeIndex = (storyIds: string[]) =>
    writeFile(
      join(directory, 'index.json'),
      JSON.stringify({
        v: 5,
        entries: Object.fromEntries(storyIds.map((id) => [id, { id }])),
      }),
    );

  const writeFixture = async (staticPath: string) => {
    await mkdir(join(directory, staticPath), { recursive: true });
    await writeFile(
      join(
        directory,
        staticPath,
        'compatibility-inventory.front-component.mjs',
      ),
      '',
    );
  };

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'inventory-storybook-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('rejects a directory without a Storybook build', async () => {
    await expect(
      assertInventoryStorybookBuild(join(directory, 'storybook-static')),
    ).rejects.toThrow('No Storybook build found');
  });

  it('rejects a build without the inventory stories', async () => {
    await writeIndex(['frontcomponent-worker-platform-apis--class-list-react']);
    await expect(assertInventoryStorybookBuild(directory)).rejects.toThrow(
      `has no ${STORY_IDS[0]} story`,
    );
  });

  it('rejects a build without the inventory fixtures', async () => {
    await writeIndex(STORY_IDS);
    await writeFixture('built');
    await expect(assertInventoryStorybookBuild(directory)).rejects.toThrow(
      'has no preact inventory fixture',
    );
  });

  it('accepts a build with both stories and fixtures', async () => {
    await writeIndex(STORY_IDS);
    await writeFixture('built');
    await writeFixture('built-preact');
    await expect(
      assertInventoryStorybookBuild(directory),
    ).resolves.toBeUndefined();
  });
});
