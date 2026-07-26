import { expect, test } from '@playwright/test';
import path from 'path';

import { LeftMenu } from '../../lib/pom/leftMenu';

// A taller frame keeps the whole pinned left column on screen, so the widget
// and the tab it is dragged into are visible in the same shot.
test.use({ video: 'on', viewport: { width: 1440, height: 1250 } });

const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');

const COMPANY_NAME = 'Google';
const WIDGET_TITLE = 'Opportunities';

test('Widget is dragged from the left column into another record page tab', async ({
  page,
}) => {
  const leftMenu = new LeftMenu(page);

  await page.goto('/');
  await leftMenu.goToCompaniesTab();

  // Record cells expose the avatar initial too, so the name is a substring.
  const companyLink = page.getByRole('link', { name: COMPANY_NAME }).first();
  await expect(companyLink).toBeVisible();
  const companyHref = await companyLink.getAttribute('href');

  if (companyHref === null) {
    throw new Error('Company record link has no href');
  }

  await page.goto(companyHref);
  // The tab bar renders hidden measurement copies, so wait on a widget instead.
  await expect(page.locator('[data-widget-id]').first()).toBeVisible();
  await page.waitForTimeout(1500);

  await page.keyboard.press('ControlOrMeta+KeyK');
  const editLayoutCommand = page.getByText('Edit Layout', { exact: true });
  await expect(editLayoutCommand).toBeVisible();
  await page.waitForTimeout(800);
  await editLayoutCommand.click();

  const leftColumnWidgets = page.locator('[data-widget-id]');
  const widget = leftColumnWidgets.filter({ hasText: WIDGET_TITLE }).first();
  await expect(widget).toBeVisible();

  const timelineWidget = leftColumnWidgets.filter({ hasText: 'July' }).first();
  await expect(timelineWidget).toBeVisible();

  // The pinned left column scrolls independently; lift the widget away from
  // the bottom edge so the whole card is comfortably inside the frame.
  await page.mouse.move(390, 600);
  for (let attempt = 0; attempt < 8; attempt++) {
    const box = await widget.boundingBox();

    if (box !== null && box.y + box.height < 880) {
      break;
    }

    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '01-01-layout-edit-mode.png'),
  });

  const widgetBox = await widget.boundingBox();
  const timelineBox = await timelineWidget.boundingBox();

  if (widgetBox === null || timelineBox === null) {
    throw new Error('Widget or destination tab content has no bounding box');
  }

  const startX = widgetBox.x + widgetBox.width / 2;
  const startY = widgetBox.y + 16;
  // Drop below the tab's existing widget, on the end-of-list drop zone.
  const dropX = timelineBox.x + timelineBox.width / 2;
  const dropY = timelineBox.y + timelineBox.height + 30;

  await page.mouse.move(startX, startY);
  await page.waitForTimeout(300);
  await page.mouse.down();
  await page.waitForTimeout(200);
  // The pointer sensor only activates past 8px, so nudge before the long move.
  await page.mouse.move(startX + 20, startY - 10, { steps: 10 });
  await page.waitForTimeout(500);

  await page.mouse.move((startX + dropX) / 2, (startY + dropY) / 2, {
    steps: 25,
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '01-02-dragging-widget.png'),
  });

  await page.mouse.move(dropX, dropY, { steps: 25 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '01-03-drop-line-in-destination-tab.png'),
  });

  await page.mouse.up();
  await page.waitForTimeout(2500);
  await page.mouse.move(1400, 1150);
  await page.waitForTimeout(1000);

  // The widget now lives in the tab area on the right, not the left column.
  const movedWidgetBox = await widget.boundingBox();
  expect(movedWidgetBox?.x ?? 0).toBeGreaterThan(widgetBox.x);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '01-04-widget-moved-into-timeline-tab.png'),
  });
  await page.waitForTimeout(800);
});
