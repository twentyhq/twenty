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

  // The front component runs in a sandboxed worker; surface browser output so
  // failures inside it are diagnosable from the test log.
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

    // The pinned global command renders as a top bar action button.
    await page
      .getByRole('button', { name: 'Record media note' })
      .first()
      .click();

    await expect(page.getByTestId(MEDIA_NOTES_TEST_IDS.root)).toBeVisible();
  };

  test('records an audio note end to end', async ({ page }) => {
    await openMediaNotesComponent(page);

    await page.getByTestId(MEDIA_NOTES_TEST_IDS.recordAudioButton).click();

    // Consent step: recording must not start before explicit confirmation.
    const startButton = page.getByTestId('media-capture-modal-start-button');
    await expect(startButton).toBeVisible();
    await expect(
      page.getByText('asking to record audio with your microphone', {
        exact: false,
      }),
    ).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-consent.png'),
    });

    await startButton.click();

    // Recording step: stop control + live timer.
    const stopButton = page.getByTestId('media-capture-modal-stop-button');
    await expect(stopButton).toBeVisible();
    await page.waitForTimeout(2500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-recording.png'),
    });

    await stopButton.click();

    // Preview step: playback before anything is shared.
    const useButton = page.getByTestId('media-capture-modal-use-button');
    await expect(useButton).toBeVisible();
    await expect(page.locator('audio')).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-preview.png'),
    });

    await useButton.click();

    // Uploaded: the component receives a playable file reference.
    await expect(
      page.getByTestId(MEDIA_NOTES_TEST_IDS.captureStatus),
    ).toHaveText('captured');
    const capturedAudio = page.getByTestId(MEDIA_NOTES_TEST_IDS.capturedAudio);
    await expect(capturedAudio).toBeVisible();

    const audioSrc = await capturedAudio.getAttribute('src');
    expect(audioSrc).toBeTruthy();
    expect(audioSrc).toContain('/file');

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-captured.png'),
    });
  });

  test('cancelling the consent step resolves as cancelled', async ({
    page,
  }) => {
    await openMediaNotesComponent(page);

    await page.getByTestId(MEDIA_NOTES_TEST_IDS.recordAudioButton).click();

    await page.getByTestId('media-capture-modal-cancel-button').click();

    await expect(
      page.getByTestId(MEDIA_NOTES_TEST_IDS.captureStatus),
    ).toHaveText('cancelled');
  });
});
