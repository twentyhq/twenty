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

    // The recording UX is the app's own UI: its timer and stop control.
    const stopButton = page.getByTestId(
      MEDIA_NOTES_TEST_IDS.stopRecordingButton,
    );
    await expect(stopButton).toBeVisible();
    await expect(
      page.getByTestId(MEDIA_NOTES_TEST_IDS.recordingTimer),
    ).toBeVisible();

    // The host contributes the one piece the app cannot spoof or remove:
    // an indicator naming the recording application while a device is live.
    await expect(page.getByTestId('media-recording-indicator')).toBeVisible();
    await expect(page.getByTestId('media-recording-indicator')).toContainText(
      'is recording audio',
    );

    await page.waitForTimeout(2500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-recording.png'),
    });

    await stopButton.click();

    // Stopping releases the device, so the host indicator disappears.
    await expect(
      page.getByTestId('media-recording-indicator'),
    ).not.toBeVisible();

    // Uploaded: the component receives a playable file reference.
    await expect(
      page.getByTestId(MEDIA_NOTES_TEST_IDS.captureStatus),
    ).toHaveText('captured');
    const capturedAudio = page.getByTestId(MEDIA_NOTES_TEST_IDS.capturedAudio);
    await expect(capturedAudio).toBeVisible();

    const audioSrc = await capturedAudio.getAttribute('src');
    expect(audioSrc).toBeTruthy();
    expect(audioSrc).toContain('/file');

    // Actually fetch it: a signed url for a folder the file guard does not
    // serve still looks correct in the src attribute but answers 401/403, so
    // asserting on the string alone would not catch an unplayable recording.
    const mediaResponse = await page.request.get(audioSrc as string);
    expect(mediaResponse.status()).toBe(200);
    // The body, not content-length: the file route streams the response, so
    // the header is absent even on a perfectly good recording.
    expect((await mediaResponse.body()).length).toBeGreaterThan(0);

    // The recording is attached to a record, which is what makes the
    // uploaded file permanent instead of a temporary orphan.
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

    await expect(page.getByTestId('media-recording-indicator')).toBeVisible();

    await page
      .getByTestId(MEDIA_NOTES_TEST_IDS.cancelRecordingButton)
      .click();

    await expect(
      page.getByTestId(MEDIA_NOTES_TEST_IDS.captureStatus),
    ).toHaveText('cancelled');
    await expect(
      page.getByTestId('media-recording-indicator'),
    ).not.toBeVisible();
  });

  test('the host indicator stop discards the recording', async ({ page }) => {
    await openMediaNotesComponent(page);

    await page.getByTestId(MEDIA_NOTES_TEST_IDS.recordAudioButton).click();

    await expect(page.getByTestId('media-recording-indicator')).toBeVisible();

    await page
      .getByTestId('media-recording-indicator-stop-button')
      .click();

    await expect(
      page.getByTestId('media-recording-indicator'),
    ).not.toBeVisible();

    // The app discovers the host stop on its next call: stop returns
    // cancelled and nothing was uploaded.
    await page
      .getByTestId(MEDIA_NOTES_TEST_IDS.stopRecordingButton)
      .click();
    await expect(
      page.getByTestId(MEDIA_NOTES_TEST_IDS.captureStatus),
    ).toHaveText('cancelled');
  });
});
