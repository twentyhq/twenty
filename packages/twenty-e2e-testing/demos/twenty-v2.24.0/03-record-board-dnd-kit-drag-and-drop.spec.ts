import { expect, test } from '@playwright/test';
import path from 'path';

import { LeftMenu } from '../../lib/pom/leftMenu';

test.use({ video: 'on' });

const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');

// Stage columns render in order: New, Screening, Meeting, Proposal, Customer.
const SOURCE_COLUMN_INDEX = 0;
const TARGET_COLUMN_INDEX = 1;

test('Record board card is dragged from New to Screening', async ({ page }) => {
  const leftMenu = new LeftMenu(page);

  await page.goto('/');
  await leftMenu.goToOpportunitiesTab();

  await page.getByText('All Opportunities', { exact: true }).click();
  await page.getByText('By Stage', { exact: true }).click();

  const columns = page.locator('[data-record-board-column-id]');
  await expect(columns.first()).toBeVisible();

  const sourceColumn = columns.nth(SOURCE_COLUMN_INDEX);
  const targetColumn = columns.nth(TARGET_COLUMN_INDEX);

  const card = sourceColumn.getByRole('link').first();
  await expect(card).toBeVisible();
  const cardHref = await card.getAttribute('href');

  if (cardHref === null) {
    throw new Error('Board card link has no href');
  }

  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '03-01-before-drag.png'),
  });

  const cardBox = await card.boundingBox();
  const targetBox = await targetColumn.boundingBox();

  if (cardBox === null || targetBox === null) {
    throw new Error('Board card or target column has no bounding box');
  }

  const startX = cardBox.x + cardBox.width / 2;
  const startY = cardBox.y + cardBox.height / 2;
  const dropX = targetBox.x + targetBox.width / 2;
  const dropY = targetBox.y + 250;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // The pointer sensor only activates past 8px, so nudge before the long move.
  await page.mouse.move(startX + 16, startY + 4, { steps: 8 });
  await page.waitForTimeout(400);
  await page.mouse.move((startX + dropX) / 2, (startY + dropY) / 2, {
    steps: 25,
  });
  await page.waitForTimeout(600);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '03-02-mid-drag.png'),
  });

  await page.mouse.move(dropX, dropY, { steps: 25 });
  await page.waitForTimeout(900);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '03-03-hovering-target-column.png'),
  });

  await page.mouse.up();
  await page.waitForTimeout(2500);
  // Park the pointer over empty canvas so no card tooltip covers the result.
  await page.mouse.move(1400, 500);
  await page.waitForTimeout(1500);

  await expect(
    targetColumn.locator(`a[href="${cardHref}"]`).first(),
  ).toBeVisible();

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '03-04-after-drop.png'),
  });
  await page.waitForTimeout(800);
});
