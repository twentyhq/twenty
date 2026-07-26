import { expect, test } from '@playwright/test';
import path from 'path';
import { DEMO_CLIP_HOLD_SECONDS, createDemoClip } from './lib/demoClip';
import { centerOf, grabPointOf, slowDrag } from './lib/slowDrag';

// Demo for PR #23071: the record board drag and drop rebuilt on dnd-kit, with a
// dragged clone following the cursor, a live preview of the landing slot, and a
// +N chip when several selected cards move together.
test.use({ video: { mode: 'on', size: { width: 1440, height: 900 } } });

const SHOTS = path.resolve(__dirname, 'captures', '03-record-board-drag-and-drop');

const cardAt = (columnIndex: number, rowIndex: number) =>
  `#record-board-card-${columnIndex}-${rowIndex}`;

// Every run permanently moves cards, so the demo always drags out of the
// fullest column and into the emptiest one. That keeps the board balanced
// across runs instead of draining whichever column is hardcoded as the source.
const pickColumns = async (page: import('@playwright/test').Page) => {
  const counts = await page.evaluate(() => {
    const perColumn: Record<number, number> = {};

    // Cards are `record-board-card-<column>-<row>`, but the same prefix is also
    // used with a record id, so only the positional ids count here.
    document.querySelectorAll('[id^="record-board-card-"]').forEach((card) => {
      const positionalId = /^record-board-card-(\d+)-(\d+)$/.exec(card.id);

      if (positionalId === null) {
        return;
      }

      const columnIndex = Number(positionalId[1]);

      perColumn[columnIndex] = (perColumn[columnIndex] ?? 0) + 1;
    });

    return perColumn;
  });

  const ranked = Object.entries(counts)
    .map(([columnIndex, count]) => ({ columnIndex: Number(columnIndex), count }))
    .sort((a, b) => b.count - a.count);

  return {
    source: ranked[0].columnIndex,
    target: ranked[ranked.length - 1].columnIndex,
  };
};

test('Move opportunity cards across board columns', async ({ page }, testInfo) => {
  const clip = createDemoClip(testInfo);

  await page.goto('/objects/opportunities');
  await page.getByRole('button', { name: /All Opportunities/ }).click();
  await page.getByText('By Stage', { exact: true }).click();

  await expect(page.getByText('Screening', { exact: true })).toBeVisible();
  await expect(page.locator(cardAt(0, 0))).toBeVisible();
  await page.mouse.move(720, 880);
  await page.waitForTimeout(1500);

  const { source, target } = await pickColumns(page);

  await expect(page.locator(cardAt(source, 2))).toBeVisible();

  await page.screenshot({ path: path.join(SHOTS, '01-board-before.png') });
  clip.begin();

  await slowDrag(page, {
    from: await grabPointOf(page.locator(cardAt(source, 0))),
    to: await centerOf(page.locator(cardAt(target, 1))),
    onHover: async () => {
      await page.screenshot({ path: path.join(SHOTS, '02-single-card-drag.png') });
    },
    restPosition: { x: 720, y: 880 },
  });

  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SHOTS, '03-single-card-dropped.png') });

  // Selecting several cards and dragging one of them moves the whole selection,
  // shown by the +N chip on the dragged clone.
  for (const rowIndex of [0, 1, 2]) {
    const card = page.locator(cardAt(source, rowIndex));
    await card.hover();
    await card.getByTestId('input-checkbox').click();
    await page.waitForTimeout(400);
  }

  await expect(page.getByText('3 selected')).toBeVisible();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SHOTS, '04-three-cards-selected.png') });

  await slowDrag(page, {
    from: await grabPointOf(page.locator(cardAt(source, 0))),
    to: await centerOf(page.locator(cardAt(target, 1))),
    onHover: async () => {
      await page.screenshot({ path: path.join(SHOTS, '05-multi-card-drag.png') });
    },
    restPosition: { x: 720, y: 880 },
  });

  // Moving several records takes longer than a single one, so the demo waits
  // for the selection banner to clear rather than for a fixed delay.
  await expect(page.getByText('3 selected')).toBeHidden({ timeout: 30_000 });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(SHOTS, '06-multi-card-dropped.png') });
  clip.end();

  // Nothing must happen on screen during the hold: it exists so the recorder
  // can catch up on a still page before the clip is cut.
  await page.waitForTimeout(DEMO_CLIP_HOLD_SECONDS * 1000);
  clip.save();
});
