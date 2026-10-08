import assert from 'node:assert/strict';
import { mkdtemp, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import {
  chromium,
  type Browser,
  type FileChooser,
  type Locator,
  type Page,
} from 'playwright';

const STORYBOOK_URL = process.env.STORYBOOK_URL ?? 'http://localhost:6008';
const SVG_CONTENTS =
  '<svg xmlns="http://www.w3.org/2000/svg" width="31" height="23"><title>Résumé 🌈</title><rect width="31" height="23" fill="red"/></svg>';
const BINARY_CONTENTS = Buffer.from([0, 1, 127, 128, 255, 10]);
const FILE_MODIFIED_AT_SECONDS = 1700000000;
const NEGATIVE_CHOOSER_TIMEOUT_MS = 300;

let browser: Browser;
let fixtureDirectory: string;
let imagePath: string;
let binaryPath: string;

declare global {
  interface Window {
    fileInputEvidence: {
      activations: boolean[];
      imageUrls: string[];
      revokedUrls: string[];
    };
  }
}

before(async () => {
  browser = await chromium.launch({ headless: true });
  fixtureDirectory = await mkdtemp(path.join(tmpdir(), 'image-input-'));
  imagePath = path.join(fixtureDirectory, 'profile.svg');
  binaryPath = path.join(fixtureDirectory, 'binary.png');
  await writeFile(imagePath, SVG_CONTENTS);
  await writeFile(binaryPath, BINARY_CONTENTS);
  await utimes(imagePath, FILE_MODIFIED_AT_SECONDS, FILE_MODIFIED_AT_SECONDS);
  await utimes(binaryPath, FILE_MODIFIED_AT_SECONDS, FILE_MODIFIED_AT_SECONDS);
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

const openChooser = async ({
  page,
  renderer,
  activation = 'pointer',
  triggerIndex = 1,
}: {
  page: Page;
  renderer: Locator;
  activation?: string;
  triggerIndex?: number;
}): Promise<FileChooser> => {
  const trigger = renderer
    .getByRole('button', { name: 'Choose profile image', exact: true })
    .nth(triggerIndex);
  const chooser = page.waitForEvent('filechooser', { timeout: 3000 });
  if (activation === 'pointer') {
    await trigger.click();
  }
  if (activation !== 'pointer') {
    await trigger.focus();
    await trigger.press(activation);
  }
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

const expectSelection = async ({
  renderer,
  filePath,
  uploads,
  contents,
  type,
}: {
  renderer: Locator;
  filePath: string;
  uploads: number;
  contents: Buffer;
  type: string;
}) => {
  await renderer
    .getByLabel('Image actions')
    .filter({ hasText: `Uploads: ${uploads};` })
    .waitFor();
  const details = renderer.getByLabel('File contents');
  await details
    .filter({ hasText: `"name":"${path.basename(filePath)}"` })
    .waitFor();
  assert.deepEqual(JSON.parse(await details.innerText()), {
    isFile: true,
    name: path.basename(filePath),
    size: contents.length,
    type,
    lastModified: Math.trunc((await stat(filePath)).mtimeMs),
    text: contents.toString('utf8'),
    bytes: Array.from(contents),
  });
  await expectInputReset(renderer);
};

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

const expectNoChooser = async ({
  page,
  activate,
}: {
  page: Page;
  activate: () => Promise<unknown>;
}) => {
  const chooser = page
    .waitForEvent('filechooser', { timeout: NEGATIVE_CHOOSER_TIMEOUT_MS })
    .then(
      () => true,
      () => false,
    );
  await activate();
  assert.equal(await chooser, false);
};

for (const runtime of ['react', 'preact']) {
  test(`${runtime}: trusted pointer, Enter and Space open the native chooser and repeat the same file`, async () => {
    const { page, primary, secondary } = await mountFixture({ runtime });
    try {
      let uploads = 0;
      for (const triggerIndex of [0, 1]) {
        for (const activation of ['pointer', 'Enter', 'Space']) {
          const chooser = await openChooser({
            page,
            renderer: primary,
            activation,
            triggerIndex,
          });
          await chooser.setFiles(imagePath);
          uploads += 1;
          await expectSelection({
            renderer: primary,
            filePath: imagePath,
            uploads,
            contents: Buffer.from(SVG_CONTENTS),
            type: 'image/svg+xml',
          });
          await page.waitForFunction(
            (image) => (image as HTMLImageElement)?.naturalWidth === 31,
            await primary.locator('img').elementHandle(),
            { timeout: 3000 },
          );
          assert.equal(
            await primary
              .locator('img')
              .evaluate((image) => (image as HTMLImageElement).naturalWidth),
            31,
          );
          assert.match(
            (await primary.locator('img').getAttribute('src')) ?? '',
            /^blob:http/,
          );
        }
      }
      assert.match(
        await secondary.getByLabel('Image actions').innerText(),
        /Uploads: 0;/,
      );
      const evidence = await page.evaluate(() => window.fileInputEvidence);
      assert.equal(evidence.imageUrls.length, 6);
      assert.equal(
        evidence.imageUrls.filter((url) => !evidence.revokedUrls.includes(url))
          .length,
        1,
      );
    } finally {
      await page.close();
    }
  });

  test(`${runtime}: empty chooser result, disabled/uploading suppression and callback replacement`, async () => {
    const { page, primary } = await mountFixture({ runtime });
    try {
      const empty = await openChooser({ page, renderer: primary });
      await empty.setFiles([]);
      assert.match(
        await primary.getByLabel('Image actions').innerText(),
        /Uploads: 0;/,
      );
      await primary
        .getByRole('button', { name: 'Disable image input' })
        .click();
      await primary
        .getByRole('button', { name: 'Choose profile image', exact: true })
        .last()
        .waitFor({ state: 'visible' });
      await expectNoChooser({
        page,
        activate: () =>
          primary
            .getByRole('button', { name: 'Choose profile image', exact: true })
            .first()
            .click({ force: true }),
      });
      await primary.getByRole('button', { name: 'Enable image input' }).click();
      await primary.getByRole('button', { name: 'Start upload' }).click();
      await primary
        .getByRole('button', { name: 'Cancel profile upload' })
        .waitFor();
      await expectNoChooser({
        page,
        activate: () =>
          primary
            .getByRole('button', { name: 'Choose profile image', exact: true })
            .click({ force: true }),
      });
      await primary
        .getByRole('button', { name: 'Cancel profile upload' })
        .click();
      await expectNoChooser({
        page,
        activate: () =>
          primary
            .getByRole('button', { name: 'Choose profile image', exact: true })
            .last()
            .dispatchEvent('click'),
      });
      const pending = await openChooser({ page, renderer: primary });
      await primary
        .getByRole('button', { name: 'Disconnect file callback' })
        .click();
      await primary
        .getByRole('button', { name: 'Connect file callback' })
        .waitFor();
      await pending.setFiles(imagePath);
      await expectInputReset(primary);
      assert.match(
        await primary.getByLabel('Image actions').innerText(),
        /Uploads: 0;/,
      );
      await primary
        .getByRole('button', { name: 'Connect file callback' })
        .click();
      const chooser = await openChooser({ page, renderer: primary });
      await chooser.setFiles(binaryPath);
      await expectSelection({
        renderer: primary,
        filePath: binaryPath,
        uploads: 1,
        contents: BINARY_CONTENTS,
        type: 'image/png',
      });
      const recovered = await openChooser({ page, renderer: primary });
      await recovered.setFiles(imagePath);
      await expectSelection({
        renderer: primary,
        filePath: imagePath,
        uploads: 2,
        contents: Buffer.from(SVG_CONTENTS),
        type: 'image/svg+xml',
      });
    } finally {
      await page.close();
    }
  });

  test(`${runtime}: renderer ownership, URL replacement, revocation and teardown`, async () => {
    const { page, primary, secondary } = await mountFixture({ runtime });
    try {
      const first = await openChooser({ page, renderer: primary });
      await first.setFiles(imagePath);
      await expectSelection({
        renderer: primary,
        filePath: imagePath,
        uploads: 1,
        contents: Buffer.from(SVG_CONTENTS),
        type: 'image/svg+xml',
      });
      const second = await openChooser({ page, renderer: secondary });
      await second.setFiles(imagePath);
      await expectSelection({
        renderer: secondary,
        filePath: imagePath,
        uploads: 1,
        contents: Buffer.from(SVG_CONTENTS),
        type: 'image/svg+xml',
      });
      const primaryUrl = await primary.locator('img').getAttribute('src');
      const secondaryUrl = await secondary.locator('img').getAttribute('src');
      assert.notEqual(primaryUrl, secondaryUrl);
      await primary
        .getByRole('button', { name: 'Remove profile image' })
        .click();
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
      const replacement = await openChooser({ page, renderer: primary });
      await replacement.setFiles(imagePath);
      await expectSelection({
        renderer: primary,
        filePath: imagePath,
        uploads: 2,
        contents: Buffer.from(SVG_CONTENTS),
        type: 'image/svg+xml',
      });
      const pending = await openChooser({ page, renderer: primary });
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
      await pending.setFiles(imagePath);
      await page.waitForFunction(() => {
        const evidence = window.fileInputEvidence;
        return (
          evidence.imageUrls.filter(
            (url) => !evidence.revokedUrls.includes(url),
          ).length === 1
        );
      });
      assert.match(
        await secondary.getByLabel('Image actions').innerText(),
        /Uploads: 1;/,
      );
      await page
        .getByRole('button', { name: 'Mount primary renderer' })
        .click();
      await primary.getByRole('group', { name: 'Profile image' }).waitFor();
      const remounted = await openChooser({ page, renderer: primary });
      await remounted.setFiles(imagePath);
      await expectSelection({
        renderer: primary,
        filePath: imagePath,
        uploads: 1,
        contents: Buffer.from(SVG_CONTENTS),
        type: 'image/svg+xml',
      });
      assert.match(
        await secondary.getByLabel('Image actions').innerText(),
        /Uploads: 1;/,
      );
    } finally {
      await page.close();
    }
  });
}
