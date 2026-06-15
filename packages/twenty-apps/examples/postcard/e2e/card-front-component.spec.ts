import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { CARD_TEST_IDS } from '../src/components/card-test-ids';

// Seeded postcard record the preview should display.
const RECORD_ID = process.env.E2E_POSTCARD_RECORD_ID;
const EXPECTED_NAME = process.env.E2E_POSTCARD_NAME;
const EXPECTED_STATUS = process.env.E2E_POSTCARD_STATUS;
const EXPECTED_CONTENT = process.env.E2E_POSTCARD_CONTENT;

const STATUS_BADGE_BACKGROUND: Record<string, string> = {
  DRAFT: 'rgb(153, 153, 153)',
  SENT: 'rgb(232, 140, 48)',
  DELIVERED: 'rgb(76, 175, 80)',
  RETURNED: 'rgb(224, 82, 82)',
};

const WORKSPACE_ORIGIN_FILE = path.resolve(
  __dirname,
  '.auth',
  'workspace-origin.txt',
);

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

// Error states rendered by card.front-component.tsx when it cannot authenticate
// or fetch the record. None of these may appear once the component renders.
const FALLBACK_TEXTS = [
  'No postcard data',
  'Record not found',
  'No record ID',
  'apiUrl: missing',
];

test.describe('Postcard card front component', () => {
  test.beforeAll(() => {
    if (!RECORD_ID) {
      throw new Error(
        'E2E_POSTCARD_RECORD_ID is required and must point to a seeded postcard record. ' +
          'Ensure the postcard app is installed and a record exists before running this test.',
      );
    }
  });

  test('renders the postcard name and status badge in the record preview', async ({
    page,
  }) => {
    await page.goto(`${resolveWorkspaceUrl()}/object/postCard/${RECORD_ID}`);

    const card = page.getByTestId(CARD_TEST_IDS.root);
    await expect(card).toBeVisible();

    const cardName = card.getByTestId(CARD_TEST_IDS.name);
    const cardStatus = card.getByTestId(CARD_TEST_IDS.status);
    const cardContent = card.getByTestId(CARD_TEST_IDS.content);

    await expect(cardName).toHaveCount(1);
    await expect(cardStatus).toHaveCount(1);
    await expect(cardContent).toHaveCount(1);

    if (EXPECTED_NAME) {
      await expect(cardName).toHaveText(EXPECTED_NAME);
    }

    if (EXPECTED_STATUS) {
      await expect(cardStatus).toHaveText(EXPECTED_STATUS);
    }

    if (EXPECTED_CONTENT) {
      await expect(cardContent).toHaveText(EXPECTED_CONTENT);
    }

    // Redundant style assertions: the front component sets every style inline, so
    // verifying the computed styles proves the component's own render + the
    // remote-dom style bridge ran end-to-end (not just that text leaked onto the
    // page). These mirror card.front-component.tsx exactly.

    // Root container.
    await expect(card).toHaveCSS('padding', '24px');

    // Name.
    await expect(cardName).toHaveCSS('font-size', '15px');
    await expect(cardName).toHaveCSS('font-weight', '600');
    await expect(cardName).toHaveCSS('color', 'rgb(51, 51, 51)');

    // Status badge: white text on a status-dependent colored, rounded chip.
    await expect(cardStatus).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(cardStatus).toHaveCSS('font-size', '11px');
    await expect(cardStatus).toHaveCSS('font-weight', '600');
    await expect(cardStatus).toHaveCSS('border-radius', '4px');
    await expect(cardStatus).toHaveCSS('padding-top', '2px');
    await expect(cardStatus).toHaveCSS('padding-bottom', '2px');
    await expect(cardStatus).toHaveCSS('padding-left', '8px');
    await expect(cardStatus).toHaveCSS('padding-right', '8px');

    if (EXPECTED_STATUS && EXPECTED_STATUS in STATUS_BADGE_BACKGROUND) {
      await expect(cardStatus).toHaveCSS(
        'background-color',
        STATUS_BADGE_BACKGROUND[EXPECTED_STATUS],
      );
    }

    // Content.
    await expect(cardContent).toHaveCSS('font-size', '14px');
    await expect(cardContent).toHaveCSS('color', 'rgb(85, 85, 85)');
    await expect(cardContent).toHaveCSS('margin', '0px');
    await expect(cardContent).toHaveCSS('white-space', 'pre-line');

    for (const fallback of FALLBACK_TEXTS) {
      await expect(page.getByText(fallback, { exact: false })).toHaveCount(0);
    }
  });
});
