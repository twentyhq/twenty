import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const portalZoomTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
  args,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);

  await userEvent.click(canvas.getByRole('button', { name: 'Toggle popup' }));
  const portalAction = await page.findByRole('button', {
    name: 'Portal action',
  });

  expect(canvasElement).not.toContainElement(portalAction);

  for (const modifier of [
    { ctrlKey: true },
    { ctrlKey: true, metaKey: true },
  ]) {
    const zoomEvent = new WheelEvent('wheel', {
      ...modifier,
      bubbles: true,
      cancelable: true,
      deltaY: -100,
    });

    portalAction.dispatchEvent(zoomEvent);

    expect(zoomEvent.defaultPrevented).toBe(
      args.shouldPreventPageZoom ?? false,
    );
  }

  for (const modifier of [{}, { metaKey: true }]) {
    const scrollEvent = new WheelEvent('wheel', {
      ...modifier,
      bubbles: true,
      cancelable: true,
      deltaY: 100,
    });

    portalAction.dispatchEvent(scrollEvent);

    expect(scrollEvent.defaultPrevented).toBe(false);
  }
  await waitFor(() =>
    expect(
      canvas.getByRole('status', { name: 'Portal wheel events' }),
    ).toHaveTextContent('Portal wheel events: 4'),
  );

  const outsideZoomEvent = new WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    ctrlKey: true,
    deltaY: -100,
  });

  canvas
    .getByRole('button', { name: 'Host action' })
    .dispatchEvent(outsideZoomEvent);

  expect(outsideZoomEvent.defaultPrevented).toBe(false);
};
