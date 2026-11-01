import { expect, test, type Locator } from 'playwright/test';
import { isDefined } from 'twenty-shared/utils';
import { MOUNT_TIMEOUT } from '../../../src/__stories__/shared/test-utils/timeouts';
import { waitForAnimationFrames } from '../../../src/__stories__/shared/test-utils/waitForAnimationFrames';
import { MAXIMUM_DROPDOWN_TRIGGER_GAP } from '../../../src/__stories__/twenty-ui-gallery/constants/MaximumDropdownTriggerGap';
import { computePopupAnchorGapAndOverlap } from '../../../src/__stories__/twenty-ui-gallery/utils/computePopupAnchorGapAndOverlap';
import { GEOMETRY_IDLE_FRAME_THRESHOLD } from '../../../src/host/geometry/constants/GeometryIdleFrameThreshold';
import { FRONT_COMPONENT_PORTAL_MARGIN } from '../../../src/constants/FrontComponentPortalMargin';
import { readBounds } from './readBounds';

const POPUP_POSITION_ROUNDING_TOLERANCE = 1;

type ElementBounds = NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>;

const isPopupAttachedToAnchor = ({
  anchor,
  popup,
  side,
}: {
  anchor: ElementBounds;
  popup: ElementBounds;
  side: string | null;
}) => {
  const isHorizontallyPositioned = side === 'left' || side === 'right';
  const isVerticallyPositioned = side === 'top' || side === 'bottom';

  if (!isHorizontallyPositioned && !isVerticallyPositioned) {
    return false;
  }

  const {
    popupAnchorGap,
    popupOverlapStart,
    popupOverlapEnd,
    anchorOverlapStart,
    anchorOverlapEnd,
  } = computePopupAnchorGapAndOverlap({ anchor, popup, side });

  return (
    popupAnchorGap >= -POPUP_POSITION_ROUNDING_TOLERANCE &&
    popupAnchorGap <= MAXIMUM_DROPDOWN_TRIGGER_GAP &&
    popupOverlapStart < anchorOverlapEnd &&
    popupOverlapEnd > anchorOverlapStart
  );
};

for (const runtime of ['react', 'preact']) {
  test(`${runtime} mirrors stylesheet layout, offset ancestry and inline custom properties`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=frontcomponent-twenty-ui-gallery--layout-measurements-${runtime}`,
    );
    await expect(page.getByTestId('geometry-layout-facts')).toContainText(
      '"columnGap":"14px"',
      { timeout: MOUNT_TIMEOUT },
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
      '"inlineAccent":"rgb(1, 2, 3)"',
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
        if (!isDefined(anchor) || !isDefined(popup) || !isDefined(owner)) {
          return false;
        }
        const viewport = page.viewportSize()!;
        const side = await menu.getAttribute('data-side');
        return (
          isPopupAttachedToAnchor({ anchor, popup, side }) &&
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
    await expect
      .poll(async () => {
        const popup = await menu.boundingBox();
        const viewport = page.viewportSize()!;
        return (
          !!popup &&
          popup.x >= -1 &&
          popup.y >= -1 &&
          popup.x + popup.width <= viewport.width + 1 &&
          popup.y + popup.height <= viewport.height + 1
        );
      })
      .toBe(true);
  });
  test(`${runtime} popup follows an anchor moving after idle without resizing`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=frontcomponent-twenty-ui-gallery--portal-geometry-${runtime}`,
    );
    const trigger = page.getByRole('button', { name: 'Open menu' });
    await expect(trigger).toBeVisible({ timeout: MOUNT_TIMEOUT });
    await trigger.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await page.evaluate(
      waitForAnimationFrames,
      GEOMETRY_IDLE_FRAME_THRESHOLD * 3,
    );
    const anchorBeforeMove = await readBounds(trigger);
    const popupBeforeMove = await readBounds(menu);

    await trigger.evaluate((node) => {
      node.style.transform = 'translateX(65px)';
    });
    await expect
      .poll(async () => {
        const anchor = await trigger.boundingBox();
        const popup = await menu.boundingBox();
        if (!isDefined(anchor) || !isDefined(popup)) {
          return false;
        }
        const side = await menu.getAttribute('data-side');
        return (
          isPopupAttachedToAnchor({ anchor, popup, side }) &&
          Math.abs(anchor.x - anchorBeforeMove.x - 65) < 1
        );
      })
      .toBe(true);
    const anchor = await readBounds(trigger);
    expect(anchor.width).toBeCloseTo(anchorBeforeMove.width);
    await expect
      .poll(async () => {
        const popup = await menu.boundingBox();
        return (
          isDefined(popup) && Math.abs(popup.x - popupBeforeMove.x - 65) < 1
        );
      })
      .toBe(true);
  });
}
