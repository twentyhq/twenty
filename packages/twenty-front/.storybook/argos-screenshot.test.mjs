import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { argosVitestPlugin } from '@argos-ci/storybook/vitest-plugin';
import { chromium } from 'playwright';

import { argosParameters } from './argosParameters.ts';

test('consecutive viewport-sized stories keep bounded screenshot dimensions', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'argos-capture-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  const browser = await chromium.launch({ headless: true });
  context.after(() => browser.close());
  const page = await browser.newPage({
    viewport: { width: 1200, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.setContent(`
    <style>
      html, body { margin: 0; }
      #vitest-tester { width: 1200px; height: 900px; }
      iframe { width: 100%; height: 100%; border: 0; }
    </style>
    <div id="vitest-tester" data-scale="1"><iframe data-vitest="true"></iframe></div>
  `);
  const frame = page
    .frames()
    .find((candidate) => candidate !== page.mainFrame());
  assert.ok(frame);
  await frame.setContent(`
    <style>
      html, body { margin: 0; }
      #layout { width: calc(100vw - 32px); height: calc(100vh - 32px); }
    </style>
  `);
  // The real plugin runs portable Storybook stories through this browser hook.
  await frame.evaluate(() => {
    globalThis.__STORYBOOK_ADDONS_PREVIEW = {
      getChannel: () => ({ emit() {} }),
    };
    globalThis.__ARGOS_STORYBOOK_STORY = {
      run: async ({ canvasElement }) => {
        canvasElement.innerHTML = '<div id="layout">Settings subdomain</div>';
      },
    };
  });
  const plugin = argosVitestPlugin({ root, uploadToArgos: false });
  const command =
    plugin.config().test.browser.commands.argosStorybookScreenshot;
  for (const name of ['first-page', 'second-page', 'third-page']) {
    await command(
      { page, frame: async () => frame },
      {
        mode: 'automatic',
        name,
        story: {
          id: name,
          tags: [],
          parameters: { argos: argosParameters },
          globals: {},
        },
      },
    );
    const header = await readFile(join(root, `${name}.png`));
    assert.deepEqual(
      [header.readUInt32BE(16), header.readUInt32BE(20)],
      [1200, 900],
    );
    const viewport = await frame.evaluate(() => [innerWidth, innerHeight]);
    assert.deepEqual(viewport, [1200, 900]);
  }
});
