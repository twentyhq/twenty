import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import pickManifest from 'npm-pick-manifest';

const manifest = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);

for (const nodeVersion of [
  '18.17.1',
  '22.12.0',
  '24.4.1',
  '24.5.0',
  '25.0.0',
]) {
  await test(`npm selects the CLI instead of the placeholder on Node ${nodeVersion}`, () => {
    const resolved = pickManifest(
      {
        name: manifest.name,
        'dist-tags': { latest: manifest.version },
        versions: {
          '0.3.0': { name: manifest.name, version: '0.3.0' },
          [manifest.version]: structuredClone(manifest),
        },
      },
      '*',
      { nodeVersion },
    );

    assert.equal(resolved.version, manifest.version);
    assert.equal(resolved.bin[manifest.name], manifest.bin);
  });
}
