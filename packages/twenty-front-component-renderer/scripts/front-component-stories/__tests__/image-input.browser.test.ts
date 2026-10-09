import assert from 'node:assert/strict';
import { mkdtemp, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import {
  chromium,
  type Browser,
  type FileChooser,
  type Locator,
} from 'playwright';

type FileFixture = {
  name: string;
  contents: Buffer;
  type: string;
};

const STORYBOOK_URL = process.env.STORYBOOK_URL ?? 'http://localhost:6008';
const SVG_FIXTURE: FileFixture = {
  name: 'profile.svg',
  contents: Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="31" height="23"><title>Résumé 🌈</title><rect width="31" height="23" fill="red"/></svg>',
  ),
  type: 'image/svg+xml',
};
const BINARY_FIXTURE: FileFixture = {
  name: 'binary.png',
  contents: Buffer.from([0, 1, 127, 128, 255, 10]),
  type: 'image/png',
};
const FILE_MODIFIED_AT_SECONDS = 1700000000;
const NEGATIVE_CHOOSER_TIMEOUT_MS = 300;

let browser: Browser;
let fixtureDirectory: string;

declare global {
  interface Window {
    fileInputEvidence: {
      activations: boolean[];
      imageUrls: string[];
      revokedUrls: string[];
    };
  }
}

const getFixturePath = (fixture: FileFixture) =>
  path.join(fixtureDirectory, fixture.name);

before(async () => {
  browser = await chromium.launch({ headless: true });
  fixtureDirectory = await mkdtemp(path.join(tmpdir(), 'image-input-'));
  for (const fixture of [SVG_FIXTURE, BINARY_FIXTURE]) {
    await writeFile(getFixturePath(fixture), fixture.contents);
    await utimes(
      getFixturePath(fixture),
      FILE_MODIFIED_AT_SECONDS,
      FILE_MODIFIED_AT_SECONDS,
    );
  }
});

after(async () => {
  await browser?.close();
  await rm(fixtureDirectory, { recursive: true, force: true });
});

const mountFixture = async ({ runtime }: { runtime: string }) => {
  const page = await browser.newPage();
  await page.addInitScript(() => {
    window.fileInputEvidence = {
      activations: [],
      imageUrls: [],
      revokedUrls: [],
    };
    const click = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function () {
      if (this.type === 'file') {
        window.fileInputEvidence.activations.push(
          navigator.userActivation.isActive,
        );
      }
      click.call(this);
    };
    const createObjectURL = URL.createObjectURL.bind(URL);
    const revokeObjectURL = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = createObjectURL(blob);
      if (blob instanceof Blob && blob.type.startsWith('image/')) {
        window.fileInputEvidence.imageUrls.push(url);
      }
      return url;
    };
    URL.revokeObjectURL = (url) => {
      window.fileInputEvidence.revokedUrls.push(url);
      revokeObjectURL(url);
    };
  });
  await page.goto(
    `${STORYBOOK_URL}/iframe.html?id=frontcomponent-imageinput-file-selection--${runtime}&viewMode=story`,
    { waitUntil: 'domcontentloaded' },
  );
  const primary = page.getByRole('region', { name: 'Primary renderer' });
  const secondary = page.getByRole('region', { name: 'Secondary renderer' });
  await primary.getByRole('group', { name: 'Profile image' }).waitFor();
  await secondary.getByRole('group', { name: 'Profile image' }).waitFor();
  return { page, primary, secondary };
};

const getChooseButtons = (renderer: Locator) =>
  renderer.getByRole('button', { name: 'Choose profile image', exact: true });

const openChooser = async ({
  renderer,
  activation = 'pointer',
  triggerIndex = 1,
}: {
  renderer: Locator;
  activation?: string;
  triggerIndex?: number;
}): Promise<FileChooser> => {
  const page = renderer.page();
  const trigger = getChooseButtons(renderer).nth(triggerIndex);
  const chooser = page.waitForEvent('filechooser', { timeout: 3000 });
  await (activation === 'pointer'
    ? trigger.click()
    : trigger.press(activation));
  const result = await chooser;
  assert.equal(
    await result
      .element()
      .evaluate(
        (input) =>
          input instanceof HTMLInputElement &&
          input.hidden &&
          input.type === 'file',
      ),
    true,
  );
  assert.equal(
    await page.evaluate(
      () =>
        window.fileInputEvidence.activations[
          window.fileInputEvidence.activations.length - 1
        ],
    ),
    true,
  );
  return result;
};

const expectUploadCount = async ({
  renderer,
  uploads,
}: {
  renderer: Locator;
  uploads: number;
}) =>
  assert.match(
    await renderer.getByLabel('Image actions').innerText(),
    new RegExp(`Uploads: ${uploads};`),
  );

const expectInputReset = async (renderer: Locator) => {
  const input = await renderer.locator('input[type="file"]').elementHandle();
  await renderer.page().waitForFunction(
    (element) => {
      const input = element as HTMLInputElement;
      return input.value === '' && input.files?.length === 0;
    },
    input,
    { timeout: 3000 },
  );
  for (const worker of renderer.page().workers()) {
    assert.equal(
      await worker.evaluate(
        () =>
          document.querySelector<HTMLInputElement>('input[type="file"]')?.files
            ?.length ?? 0,
      ),
      0,
    );
  }
};

const expectSelection = async ({
  renderer,
  fixture,
  uploads,
}: {
  renderer: Locator;
  fixture: FileFixture;
  uploads: number;
}) => {
  await renderer
    .getByLabel('Image actions')
    .filter({ hasText: `Uploads: ${uploads};` })
    .waitFor();
  const details = renderer.getByLabel('File contents');
  await details.filter({ hasText: `"name":"${fixture.name}"` }).waitFor();
  assert.deepEqual(JSON.parse(await details.innerText()), {
    isFile: true,
    name: fixture.name,
    size: fixture.contents.length,
    type: fixture.type,
    lastModified: FILE_MODIFIED_AT_SECONDS * 1000,
    text: fixture.contents.toString('utf8'),
    bytes: Array.from(fixture.contents),
  });
  await expectInputReset(renderer);
};

const selectFile = async ({
  renderer,
  fixture,
  uploads,
  activation,
  triggerIndex,
}: {
  renderer: Locator;
  fixture: FileFixture;
  uploads: number;
  activation?: string;
  triggerIndex?: number;
}) => {
  const chooser = await openChooser({ renderer, activation, triggerIndex });
  await chooser.setFiles(getFixturePath(fixture));
  await expectSelection({ renderer, fixture, uploads });
};

const expectNoChooser = async ({
  renderer,
  activate,
}: {
  renderer: Locator;
  activate: () => Promise<unknown>;
}) => {
  const chooser = renderer
    .page()
    .waitForEvent('filechooser', { timeout: NEGATIVE_CHOOSER_TIMEOUT_MS })
    .then(
      () => true,
      () => false,
    );
  await activate();
  assert.equal(await chooser, false);
};

for (const runtime of ['react', 'preact']) {
  test(`${runtime}: trusted pointer, Enter and Space open the native chooser and repeat the same file`, async (t) => {
    const { page, primary, secondary } = await mountFixture({ runtime });
    t.after(() => page.close());
    let uploads = 0;
    for (const triggerIndex of [0, 1]) {
      for (const activation of ['pointer', 'Enter', 'Space']) {
        uploads += 1;
        await selectFile({
          renderer: primary,
          fixture: SVG_FIXTURE,
          uploads,
          activation,
          triggerIndex,
        });
        await page.waitForFunction(
          (image) => (image as HTMLImageElement).naturalWidth === 31,
          await primary.locator('img').elementHandle(),
          { timeout: 3000 },
        );
        assert.match(
          (await primary.locator('img').getAttribute('src')) ?? '',
          /^blob:http/,
        );
      }
    }
    await expectUploadCount({ renderer: secondary, uploads: 0 });
    const evidence = await page.evaluate(() => window.fileInputEvidence);
    assert.equal(evidence.imageUrls.length, 6);
    assert.equal(
      evidence.imageUrls.filter((url) => !evidence.revokedUrls.includes(url))
        .length,
      1,
    );
  });

  test(`${runtime}: empty chooser result, disabled/uploading suppression and callback replacement`, async (t) => {
    const { page, primary, secondary } = await mountFixture({ runtime });
    t.after(() => page.close());
    const chooseButtons = getChooseButtons(primary);
    await secondary.getByLabel('Image actions').click();
    await expectNoChooser({
      renderer: primary,
      activate: () => chooseButtons.last().dispatchEvent('click'),
    });
    const empty = await openChooser({ renderer: primary });
    await empty.setFiles([]);
    await expectUploadCount({ renderer: primary, uploads: 0 });
    await primary.getByRole('button', { name: 'Disable image input' }).click();
    await chooseButtons.last().waitFor({ state: 'visible' });
    await expectNoChooser({
      renderer: primary,
      activate: () => chooseButtons.first().click({ force: true }),
    });
    await primary.getByRole('button', { name: 'Enable image input' }).click();
    await primary.getByRole('button', { name: 'Start upload' }).click();
    await primary
      .getByRole('button', { name: 'Cancel profile upload' })
      .waitFor();
    await expectNoChooser({
      renderer: primary,
      activate: () => chooseButtons.click({ force: true }),
    });
    await primary
      .getByRole('button', { name: 'Cancel profile upload' })
      .click();
    const pending = await openChooser({ renderer: primary });
    await primary
      .getByRole('button', { name: 'Disconnect file callback' })
      .click();
    await primary
      .getByRole('button', { name: 'Connect file callback' })
      .waitFor();
    await pending.setFiles(getFixturePath(SVG_FIXTURE));
    await expectInputReset(primary);
    await expectUploadCount({ renderer: primary, uploads: 0 });
    await primary
      .getByRole('button', { name: 'Connect file callback' })
      .click();
    await selectFile({
      renderer: primary,
      fixture: BINARY_FIXTURE,
      uploads: 1,
    });
    await selectFile({ renderer: primary, fixture: SVG_FIXTURE, uploads: 2 });
  });

  test(`${runtime}: renderer ownership, URL replacement, revocation and teardown`, async (t) => {
    const { page, primary, secondary } = await mountFixture({ runtime });
    t.after(() => page.close());
    await selectFile({ renderer: primary, fixture: SVG_FIXTURE, uploads: 1 });
    await selectFile({ renderer: secondary, fixture: SVG_FIXTURE, uploads: 1 });
    const primaryUrl = await primary.locator('img').getAttribute('src');
    const secondaryUrl = await secondary.locator('img').getAttribute('src');
    assert.notEqual(primaryUrl, secondaryUrl);
    await primary.getByRole('button', { name: 'Revoke preview URL' }).click();
    await primary
      .getByLabel('Revoked preview URL')
      .filter({ hasText: 'blob:' })
      .waitFor();
    assert.equal(await primary.locator('img').getAttribute('src'), primaryUrl);
    assert.equal(
      await primary
        .locator('img')
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      31,
    );
    await primary.getByRole('button', { name: 'Remove profile image' }).click();
    await primary.locator('img').waitFor({ state: 'detached' });
    assert.equal(
      await secondary.locator('img').getAttribute('src'),
      secondaryUrl,
    );
    assert.equal(
      await page.evaluate(
        (url) => window.fileInputEvidence.revokedUrls.includes(url!),
        primaryUrl,
      ),
      true,
    );
    await selectFile({ renderer: primary, fixture: SVG_FIXTURE, uploads: 2 });
    const pending = await openChooser({ renderer: primary });
    await page
      .getByRole('button', { name: 'Unmount primary renderer' })
      .click();
    await primary
      .getByRole('group', { name: 'Profile image' })
      .waitFor({ state: 'detached' });
    assert.equal(
      await pending.element().evaluate((input) => input.isConnected),
      false,
    );
    await pending.setFiles(getFixturePath(SVG_FIXTURE));
    await page.waitForFunction(() => {
      const evidence = window.fileInputEvidence;
      return (
        evidence.imageUrls.filter((url) => !evidence.revokedUrls.includes(url))
          .length === 1
      );
    });
    await expectUploadCount({ renderer: secondary, uploads: 1 });
    await page.getByRole('button', { name: 'Mount primary renderer' }).click();
    await primary.getByRole('group', { name: 'Profile image' }).waitFor();
    await selectFile({ renderer: primary, fixture: SVG_FIXTURE, uploads: 1 });
    await expectUploadCount({ renderer: secondary, uploads: 1 });
  });
}
