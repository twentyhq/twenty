import { isDefined } from 'twenty-shared/utils';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

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

  const hostAction = canvas.getByRole('button', { name: 'Host action' });
  const hostRectangle = hostAction.getBoundingClientRect();
  const hostCenter = {
    x: hostRectangle.left + hostRectangle.width / 2,
    y: hostRectangle.top + hostRectangle.height / 2,
  };
  expect(
    hostAction.contains(
      hostDocument.elementFromPoint(hostCenter.x, hostCenter.y),
    ),
  ).toBe(true);

  await userEvent.click(
    canvas.getByRole('button', { name: 'Fill portal area' }),
  );
  const oversizedPortal = await canvas.findByRole('button', {
    name: 'Oversized portal',
  });
  expect(oversizedPortal.getBoundingClientRect().width).toBe(4000);
  const ownerRectangle = ownerRoot.getBoundingClientRect();
  expect(
    oversizedPortal.contains(
      hostDocument.elementFromPoint(
        ownerRectangle.left + ownerRectangle.width / 2,
        ownerRectangle.top + ownerRectangle.height / 2,
      ),
    ),
  ).toBe(true);
  expect(
    hostAction.contains(
      hostDocument.elementFromPoint(hostCenter.x, hostCenter.y),
    ),
  ).toBe(true);
  await userEvent.click(hostAction);
  expect(
    canvas.getByRole('status', { name: 'Host actions' }),
  ).toHaveTextContent('Host actions: 1');
  expect(errorHandler).not.toHaveBeenCalled();
};
