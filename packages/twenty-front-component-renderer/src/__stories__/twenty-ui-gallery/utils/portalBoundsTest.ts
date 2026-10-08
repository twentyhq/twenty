import { expect, userEvent, waitFor, within } from 'storybook/test';

import { clickElementOnceItReceivesPointer } from '@/__stories__/shared/test-utils/clickElementOnceItReceivesPointer';
import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectElementToReceivePointer } from '@/__stories__/shared/test-utils/matchers/expectElementToReceivePointer';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { waitForSandboxRoundTrip } from '@/__stories__/shared/test-utils/waitForSandboxRoundTrip';
import { OVERSIZED_PORTAL_EXTENT } from '@/__stories__/twenty-ui-gallery/constants/OversizedPortalExtent';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { FRONT_COMPONENT_PORTAL_MARGIN } from '@/constants/FrontComponentPortalMargin';

const MAXIMUM_MENU_TRIGGER_GAP = 16;

const expectPortalActionAtOwnerBottom = ({
  portalAction,
  ownerRoot,
}: {
  portalAction: Element;
  ownerRoot: Element;
}) => {
  expect(portalAction.getBoundingClientRect().top).toBeCloseTo(
    ownerRoot.getBoundingClientRect().bottom,
    0,
  );
  expectElementToReceivePointer(portalAction);
};

const expectMenuAttachedToTriggerWithinPortalArea = ({
  menu,
  menuTrigger,
  ownerRoot,
}: {
  menu: Element;
  menuTrigger: Element;
  ownerRoot: Element;
}) => {
  const menuRectangle = menu.getBoundingClientRect();
  const menuTriggerRectangle = menuTrigger.getBoundingClientRect();
  const ownerRectangle = ownerRoot.getBoundingClientRect();
  const menuTriggerGap = Math.max(
    menuRectangle.top - menuTriggerRectangle.bottom,
    menuTriggerRectangle.top - menuRectangle.bottom,
  );

  expect(menuTriggerGap).toBeGreaterThanOrEqual(0);
  expect(menuTriggerGap).toBeLessThanOrEqual(MAXIMUM_MENU_TRIGGER_GAP);
  expect(menuRectangle.left).toBeLessThan(menuTriggerRectangle.right);
  expect(menuRectangle.right).toBeGreaterThan(menuTriggerRectangle.left);
  expect(menuRectangle.top).toBeGreaterThanOrEqual(
    ownerRectangle.top - FRONT_COMPONENT_PORTAL_MARGIN,
  );
  expect(menuRectangle.bottom).toBeLessThanOrEqual(
    ownerRectangle.bottom + FRONT_COMPONENT_PORTAL_MARGIN,
  );
};

export const portalBoundsTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const hostDocument = canvasElement.ownerDocument;
  const page = within(hostDocument.body);
  await expectFrontComponentMounted(canvas);

  const ownerRoot = canvas.getByRole('group', { name: 'Widget' });
  const trigger = canvas.getByRole('button', { name: 'Toggle popup' });
  await userEvent.click(trigger);
  const portalAction = await page.findByRole('button', {
    name: 'Portal action',
  });
  expect(portalAction).toBeVisible();
  expect(ownerRoot).toContainElement(trigger);
  expect(ownerRoot).not.toContainElement(portalAction);
  await waitFor(() =>
    expectPortalActionAtOwnerBottom({ portalAction, ownerRoot }),
  );

  const scrollFrame = canvas.getByRole('region', {
    name: 'Widget scroll frame',
  });
  scrollFrame.scrollTop = 40;
  expect(scrollFrame.scrollTop).toBe(40);
  await waitFor(() =>
    expectPortalActionAtOwnerBottom({ portalAction, ownerRoot }),
  );

  const rootStyle = hostDocument.documentElement.style;
  const previousZoom = rootStyle.getPropertyValue('zoom');
  const previousScale = rootStyle.getPropertyValue('--t-zoom');

  try {
    rootStyle.setProperty('--t-zoom', '0.8');
    rootStyle.setProperty('zoom', 'var(--t-zoom)');
    await waitFor(() =>
      expectPortalActionAtOwnerBottom({ portalAction, ownerRoot }),
    );
  } finally {
    rootStyle.setProperty('zoom', previousZoom);
    rootStyle.setProperty('--t-zoom', previousScale);
  }

  await waitFor(() =>
    expectPortalActionAtOwnerBottom({ portalAction, ownerRoot }),
  );

  await waitForSandboxRoundTrip();
  const ownerTopBeforeShift = ownerRoot.getBoundingClientRect().top;
  await userEvent.click(canvas.getByRole('button', { name: 'Shift widget' }));
  await waitFor(() =>
    expect(ownerRoot.getBoundingClientRect().top).toBeGreaterThan(
      ownerTopBeforeShift,
    ),
  );
  await waitFor(() =>
    expectPortalActionAtOwnerBottom({ portalAction, ownerRoot }),
  );

  await userEvent.click(portalAction);
  await waitFor(() =>
    expect(
      canvas.getByRole('status', { name: 'Portal actions' }),
    ).toHaveTextContent('Portal actions: 1'),
  );
  await userEvent.click(trigger);
  await waitFor(() =>
    expect(page.queryByRole('button', { name: 'Portal action' })).toBeNull(),
  );

  const menuTrigger = canvas.getByRole('button', { name: 'Open menu' });
  await userEvent.click(menuTrigger);
  const firstMenuItem = await page.findByRole('menuitem', {
    name: 'Menu item 1',
  });
  await waitFor(() => {
    expectElementToReceivePointer(firstMenuItem);
    expectMenuAttachedToTriggerWithinPortalArea({
      menu: page.getByRole('menu'),
      menuTrigger,
      ownerRoot,
    });
  });
  const lastMenuItem = page.getByRole('menuitem', { name: 'Menu item 16' });
  lastMenuItem.scrollIntoView({ block: 'nearest' });
  await clickElementOnceItReceivesPointer(lastMenuItem);
  await waitFor(() =>
    expect(
      canvas.getByRole('status', { name: 'Menu selection' }),
    ).toHaveTextContent('Menu selection: Menu item 16'),
  );
  await waitFor(() => expect(page.queryByRole('menu')).toBeNull());

  const hostAction = canvas.getByRole('button', { name: 'Host action' });
  expectElementToReceivePointer(hostAction);

  const hostScrollingElement = hostDocument.documentElement;
  const hostScrollSizeBeforeOversizedPortal = {
    width: hostScrollingElement.scrollWidth,
    height: hostScrollingElement.scrollHeight,
  };
  await userEvent.click(
    canvas.getByRole('button', { name: 'Fill portal area' }),
  );
  const oversizedPortal = await page.findByRole('button', {
    name: 'Oversized portal',
  });
  expect(oversizedPortal.getBoundingClientRect().width).toBe(
    OVERSIZED_PORTAL_EXTENT,
  );
  expect(hostScrollingElement.scrollWidth).toBe(
    hostScrollSizeBeforeOversizedPortal.width,
  );
  expect(hostScrollingElement.scrollHeight).toBe(
    hostScrollSizeBeforeOversizedPortal.height,
  );
  expectElementToReceivePointer(oversizedPortal, ownerRoot);
  expectElementToReceivePointer(hostAction);
  await userEvent.click(hostAction);
  expect(
    canvas.getByRole('status', { name: 'Host actions' }),
  ).toHaveTextContent('Host actions: 1');
  expect(errorHandler).not.toHaveBeenCalled();
};
