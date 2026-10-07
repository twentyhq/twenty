import { isDefined } from 'twenty-shared/utils';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectElementToReceivePointer } from '@/__stories__/shared/test-utils/matchers/expectElementToReceivePointer';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { FRONT_COMPONENT_PORTAL_MARGIN } from '@/constants/FrontComponentPortalMargin';

const MAXIMUM_MENU_TRIGGER_GAP = 16;

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
  await expectFrontComponentMounted(canvas);

  const trigger = canvas.getByRole('button', { name: 'Toggle popup' });
  await userEvent.click(trigger);
  const portalAction = await canvas.findByRole('button', {
    name: 'Portal action',
  });
  expect(portalAction).toBeVisible();

  const ownerRoot = trigger.closest('[data-front-component-root]');
  if (!isDefined(ownerRoot)) {
    throw new Error('Front component root was not found');
  }
  expect(portalAction.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    ownerRoot.getBoundingClientRect().bottom,
  );
  expectElementToReceivePointer(portalAction);

  const scrollFrame = canvas.getByRole('region', {
    name: 'Widget scroll frame',
  });
  scrollFrame.scrollTop = 40;
  expect(scrollFrame.scrollTop).toBe(40);
  await waitFor(() => {
    expect(portalAction.getBoundingClientRect().top).toBeCloseTo(
      ownerRoot.getBoundingClientRect().bottom,
      0,
    );
    expectElementToReceivePointer(portalAction);
  });

  const rootStyle = hostDocument.documentElement.style;
  const previousZoom = rootStyle.getPropertyValue('zoom');
  const previousScale = rootStyle.getPropertyValue('--t-zoom');

  try {
    rootStyle.setProperty('--t-zoom', '0.8');
    rootStyle.setProperty('zoom', 'var(--t-zoom)');
    await waitFor(() => {
      expect(portalAction.getBoundingClientRect().top).toBeCloseTo(
        ownerRoot.getBoundingClientRect().bottom,
        0,
      );
      expectElementToReceivePointer(portalAction);
    });
  } finally {
    rootStyle.setProperty('zoom', previousZoom);
    rootStyle.setProperty('--t-zoom', previousScale);
  }

  await waitFor(() => {
    expect(portalAction.getBoundingClientRect().top).toBeCloseTo(
      ownerRoot.getBoundingClientRect().bottom,
      0,
    );
  });

  await userEvent.click(portalAction);
  await waitFor(() =>
    expect(
      canvas.getByRole('status', { name: 'Portal actions' }),
    ).toHaveTextContent('Portal actions: 1'),
  );
  await userEvent.click(trigger);
  await waitFor(() =>
    expect(canvas.queryByRole('button', { name: 'Portal action' })).toBeNull(),
  );

  const menuTrigger = canvas.getByRole('button', { name: 'Open menu' });
  await userEvent.click(menuTrigger);
  const firstMenuItem = await canvas.findByRole('menuitem', {
    name: 'Menu item 1',
  });
  await waitFor(() => {
    expectElementToReceivePointer(firstMenuItem);
    expectMenuAttachedToTriggerWithinPortalArea({
      menu: canvas.getByRole('menu'),
      menuTrigger,
      ownerRoot,
    });
  });
  const lastMenuItem = canvas.getByRole('menuitem', { name: 'Menu item 16' });
  lastMenuItem.scrollIntoView({ block: 'nearest' });
  await waitFor(() => expectElementToReceivePointer(lastMenuItem));
  await userEvent.click(lastMenuItem);
  await waitFor(() =>
    expect(
      canvas.getByRole('status', { name: 'Menu selection' }),
    ).toHaveTextContent('Menu selection: Menu item 16'),
  );
  await waitFor(() => expect(canvas.queryByRole('menu')).toBeNull());

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
  const oversizedPortal = await canvas.findByRole('button', {
    name: 'Oversized portal',
  });
  expect(oversizedPortal.getBoundingClientRect().width).toBe(4000);
  expect(hostScrollingElement.scrollWidth).toBe(
    hostScrollSizeBeforeOversizedPortal.width,
  );
  expect(hostScrollingElement.scrollHeight).toBe(
    hostScrollSizeBeforeOversizedPortal.height,
  );
  const ownerRectangle = ownerRoot.getBoundingClientRect();
  expect(
    oversizedPortal.contains(
      hostDocument.elementFromPoint(
        ownerRectangle.left + ownerRectangle.width / 2,
        ownerRectangle.top + ownerRectangle.height / 2,
      ),
    ),
  ).toBe(true);
  expectElementToReceivePointer(hostAction);
  await userEvent.click(hostAction);
  expect(
    canvas.getByRole('status', { name: 'Host actions' }),
  ).toHaveTextContent('Host actions: 1');
  expect(errorHandler).not.toHaveBeenCalled();
};
