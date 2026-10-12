import { expect, test } from 'playwright/test';
import { GEOMETRY_IDLE_FRAME_THRESHOLD } from '../../../src/host/geometry/constants/GeometryIdleFrameThreshold';
import { FRONT_COMPONENT_PORTAL_MARGIN } from '../../../src/constants/FrontComponentPortalMargin';

for (const runtime of ['react', 'preact']) {
  test(`${runtime} mirrors stylesheet layout, offset ancestry and scoped theme values`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=frontcomponent-twenty-ui-gallery--layout-measurements-${runtime}`,
    );
    await expect(page.getByTestId('geometry-layout-facts')).toContainText(
      '"columnGap":"14px"',
    );
    await expect(page.getByTestId('geometry-layout-facts')).toContainText(
      '"direction":"rtl"',
    );
    await expect(page.getByTestId('geometry-layout-facts')).toContainText(
      '"display":"flex"',
    );
    await expect(page.getByTestId('geometry-layout-facts')).toContainText(
      '"offsetLeft":12',
    );
    await expect(page.getByTestId('geometry-layout-facts')).toContainText(
      '"offsetTop":14',
    );
    await expect(page.getByTestId('geometry-layout-facts')).toContainText(
      '"hasOwnedOffsetParent":true',
    );
    await expect(page.getByTestId('geometry-layout-facts')).toContainText(
      '"themeBackground":"rgb(1, 2, 3)"',
    );
  });

  test(`${runtime} keeps popup placement inside owner and page bounds under transforms, RTL and scrolling`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=frontcomponent-twenty-ui-gallery--portal-geometry-${runtime}`,
    );
    const widget = page.getByRole('group', { name: 'Widget', exact: true });
    const frame = page.getByRole('region', { name: 'Widget scroll frame' });
    await expect(widget).toBeVisible();
    await frame.evaluate((node) => {
      node.style.direction = 'rtl';
      node.style.transform = 'scale(0.85)';
      node.style.transformOrigin = 'top left';
      node.style.position = 'relative';
      node.scrollTop = 35;
    });
    const trigger = page.getByRole('button', { name: 'Open menu' });
    await trigger.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect
      .poll(async () => {
        const anchor = await trigger.boundingBox();
        const popup = await menu.boundingBox();
        const owner = await widget.boundingBox();
        if (!anchor || !popup || !owner) return false;
        const viewport = page.viewportSize()!;
        return (
          popup.x < anchor.x + anchor.width &&
          popup.x + popup.width > anchor.x &&
          popup.x >= Math.max(0, owner.x - FRONT_COMPONENT_PORTAL_MARGIN) - 1 &&
          popup.y >= Math.max(0, owner.y - FRONT_COMPONENT_PORTAL_MARGIN) - 1 &&
          popup.x + popup.width <=
            Math.min(
              viewport.width,
              owner.x + owner.width + FRONT_COMPONENT_PORTAL_MARGIN,
            ) +
              1 &&
          popup.y + popup.height <=
            Math.min(
              viewport.height,
              owner.y + owner.height + FRONT_COMPONENT_PORTAL_MARGIN,
            ) +
              1
        );
      })
      .toBe(true);
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    await frame.evaluate((node) => {
      const positionedFrame = node.parentElement;
      if (positionedFrame) positionedFrame.style.margin = '0';
      node.style.transform = '';
      node.scrollTop = 0;
    });
    await trigger.click();
    await expect(menu).toBeVisible();
    await expect.poll(async () => {
      const popup = await menu.boundingBox();
      const viewport = page.viewportSize()!;
      return !!popup && popup.x >= -1 && popup.y >= -1 &&
        popup.x + popup.width <= viewport.width + 1 &&
        popup.y + popup.height <= viewport.height + 1;
    }).toBe(true);
  });
  test(`${runtime} popup follows an anchor moving after idle without resizing`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=frontcomponent-twenty-ui-gallery--portal-geometry-${runtime}`,
    );
    const trigger = page.getByRole('button', { name: 'Open menu' });
    await expect(trigger).toBeVisible();
    await trigger.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await page.evaluate(async (frameCount) => {
      for (let frame = 0; frame < frameCount; frame += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
    }, GEOMETRY_IDLE_FRAME_THRESHOLD * 3);
    const before = await trigger.boundingBox();
    await trigger.evaluate((node) => {
      node.style.transform = 'translateX(65px)';
    });
    await expect
      .poll(async () => {
        const anchor = await trigger.boundingBox();
        const popup = await menu.boundingBox();
        if (!anchor || !popup) return false;
        return (
          popup.x < anchor.x + anchor.width &&
          popup.x + popup.width > anchor.x &&
          Math.abs(anchor.x - before!.x - 65) < 1
        );
      })
      .toBe(true);
    const anchor = await trigger.boundingBox();
    expect(anchor!.width).toBeCloseTo(before!.width);
    await expect
      .poll(async () => {
        const popup = await menu.boundingBox();
        return popup!.x;
      })
      .toBeGreaterThan(before!.x + 25);
  });
}
