import { expect, test } from '@playwright/test';
import path from 'path';
import { centerOf, grabPointOf, slowDrag } from './lib/slowDrag';

// Demo for PR #23071: the record board drag and drop rebuilt on dnd-kit, with a
// dragged clone following the cursor, a live preview of the landing slot, and a
// +N chip when several selected cards move together.
test.use({ video: { mode: 'on', size: { width: 1440, height: 900 } } });

const SHOTS = path.resolve(__dirname, 'captures', '03-record-board-drag-and-drop');

const cardAt = (columnIndex: number, rowIndex: number) =>
  `#record-board-card-${columnIndex}-${rowIndex}`;

test('Move opportunity cards across board columns', async ({ page }) => {
  await page.goto('/objects/opportunities');
  await page.getByRole('button', { name: /All Opportunities/ }).click();
  await page.getByText('By Stage', { exact: true }).click();

  await expect(page.getByText('Screening', { exact: true })).toBeVisible();
  await expect(page.locator(cardAt(0, 0))).toBeVisible();
  await page.mouse.move(720, 880);
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(SHOTS, '01-board-before.png') });

  await slowDrag(page, {
    from: await grabPointOf(page.locator(cardAt(0, 0))),
    to: await centerOf(page.locator(cardAt(3, 1))),
    onHover: async () => {
      await page.screenshot({ path: path.join(SHOTS, '02-single-card-drag.png') });
    },
  });

  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SHOTS, '03-single-card-dropped.png') });

  // Selecting several cards and dragging one of them moves the whole selection,
  // shown by the +N chip on the dragged clone.
  for (const rowIndex of [0, 1, 2]) {
    const card = page.locator(cardAt(0, rowIndex));
    await card.hover();
    await card.getByTestId('input-checkbox').click();
    await page.waitForTimeout(400);
  }

  await expect(page.getByText('3 selected')).toBeVisible();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SHOTS, '04-three-cards-selected.png') });

  await slowDrag(page, {
    from: await grabPointOf(page.locator(cardAt(0, 0))),
    to: await centerOf(page.locator(cardAt(2, 1))),
    onHover: async () => {
      await page.screenshot({ path: path.join(SHOTS, '05-multi-card-drag.png') });
    },
  });

  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(SHOTS, '06-multi-card-dropped.png') });
});
