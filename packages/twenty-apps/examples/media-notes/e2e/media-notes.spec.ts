import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { MEDIA_NOTES_TEST_IDS } from '../src/components/media-notes-test-ids';

const WORKSPACE_ORIGIN_FILE = path.resolve(
  __dirname,
  '.auth',
  'workspace-origin.txt',
);

const SCREENSHOT_DIR = path.resolve(__dirname, '.results', 'screenshots');

const resolveWorkspaceUrl = (): string => {
  const fromEnv = process.env.E2E_WORKSPACE_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  try {
    return fs
      .readFileSync(WORKSPACE_ORIGIN_FILE, 'utf8')
      .trim()
      .replace(/\/$/, '');
  } catch {
    return 'http://app.localhost:3001';
  }
};

test.describe('Media notes capture flow', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  // The component runs in a sandboxed worker, so forward browser output to the test log.
  test.beforeEach(({ page }) => {
    page.on('console', (message) => {
      console.log(`[browser:${message.type()}] ${message.text()}`);
    });
    page.on('pageerror', (error) => {
      console.log(`[pageerror] ${error.message}`);
    });
    page.on('response', (response) => {
      if (response.status() >= 400) {
        console.log(
          `[response ${response.status()}] ${response.request().method()} ${response.url()}`,
        );
      }
    });
  });

  const openMediaNotesComponent = async (
    page: import('@playwright/test').Page,
  ) => {
    await page.goto(`${resolveWorkspaceUrl()}/`);

    await page
      .getByRole('button', { name: 'Record media note' })
      .first()
      .click();

    await expect(page.getByTestId(MEDIA_NOTES_TEST_IDS.root)).toBeVisible();
  };

  test('records an audio note end to end', async ({ page }) => {
    await openMediaNotesComponent(page);

    await page.getByTestId(MEDIA_NOTES_TEST_IDS.recordAudioButton).click();

    const stopButton = page.getByTestId(
      MEDIA_NOTES_TEST_IDS.stopRecordingButton,
    );
    await expect(stopButton).toBeVisible();
    await expect(
      page.getByTestId(MEDIA_NOTES_TEST_IDS.recordingTimer),
    ).toBeVisible();

    await page.waitForTimeout(2500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-recording.png'),
    });

    await stopButton.click();

    await expect(
      page.getByTestId(MEDIA_NOTES_TEST_IDS.captureStatus),
    ).toHaveText('captured');
    const capturedAudio = page.getByTestId(MEDIA_NOTES_TEST_IDS.capturedAudio);
    await expect(capturedAudio).toBeVisible();

    const audioSrc = await capturedAudio.getAttribute('src');
    expect(audioSrc).toBeTruthy();
    expect(audioSrc).toContain('/file');

    // An unservable signed url still looks right in src but answers 401/403, so fetch it.
    const mediaResponse = await page.request.get(audioSrc as string);
    expect(mediaResponse.status()).toBe(200);
    // The file route streams, so content-length is absent even on a good recording.
    expect((await mediaResponse.body()).length).toBeGreaterThan(0);

    await expect(
      page.getByTestId(MEDIA_NOTES_TEST_IDS.savedRecord),
    ).toContainText('Attached to media note');

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-captured.png'),
    });
  });

  test('cancelling a recording resolves as cancelled', async ({ page }) => {
    await openMediaNotesComponent(page);

    await page.getByTestId(MEDIA_NOTES_TEST_IDS.recordAudioButton).click();

    await expect(
      page.getByTestId(MEDIA_NOTES_TEST_IDS.recordingTimer),
    ).toBeVisible();

    await page.getByTestId(MEDIA_NOTES_TEST_IDS.cancelRecordingButton).click();

    await expect(
      page.getByTestId(MEDIA_NOTES_TEST_IDS.captureStatus),
    ).toHaveText('cancelled');
  });
});
