import { expect, test } from '@playwright/test';
import path from 'path';
import { centerOf, grabPointOf, slowDrag } from './lib/slowDrag';

// Demo for PR #23023: while editing a record page layout, a widget can be
// dragged out of one tab and dropped into another one at a precise position.
test.use({ video: { mode: 'on', size: { width: 1440, height: 900 } } });

const SHOTS = path.resolve(__dirname, 'captures', '01-drag-widgets-across-tabs');

const GOOGLE_COMPANY_RECORD =
  '/object/company/20202020-a305-41e7-8c72-ba44072a4c58';

test('Drag the Fields widget from the pinned column into the Files tab', async ({
  page,
}) => {
  await page.goto(GOOGLE_COMPANY_RECORD);
  await expect(page.getByText('Google', { exact: true }).first()).toBeVisible();

  await page.getByTestId('page-header-side-panel-button').click();
  await page.getByText('Edit Layout', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  await page.waitForTimeout(1200);

  const filesTab = page.getByRole('button', { name: 'Files', exact: true });
  await filesTab.click();

  const fieldsWidgetTitle = page.getByText('Fields', { exact: true }).first();
  const filesWidgetTitle = page.getByText('Files', { exact: true }).last();

  await expect(fieldsWidgetTitle).toBeVisible();
  await expect(filesWidgetTitle).toBeVisible();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(SHOTS, '01-before-drag.png') });

  const from = await grabPointOf(fieldsWidgetTitle);
  const to = await centerOf(filesWidgetTitle);

  await slowDrag(page, {
    from,
    to: { x: to.x, y: to.y - 10 },
    onHover: async () => {
      await page.screenshot({ path: path.join(SHOTS, '02-mid-drag.png') });
    },
  });

  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SHOTS, '03-dropped-in-files-tab.png') });

  // The widget now belongs to the Files tab: it is gone from the pinned column
  // and from every other tab.
  await page.getByRole('button', { name: 'Timeline', exact: true }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SHOTS, '04-timeline-tab.png') });

  await filesTab.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SHOTS, '05-back-on-files-tab.png') });

  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(1000);
});
