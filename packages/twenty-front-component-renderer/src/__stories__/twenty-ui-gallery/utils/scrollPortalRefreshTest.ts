import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { waitForGeometryTrackerToIdle } from '@/__stories__/twenty-ui-gallery/utils/waitForGeometryTrackerToIdle';

const HOST_SCROLL_TOP = 120;

export const scrollPortalRefreshTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);

  const readPortalButton = canvas.getByRole('button', {
    name: 'Read portal scroll',
  });
  const portalRead = canvas.getByRole('status', { name: 'Portal read' });

  await userEvent.click(readPortalButton);
  await waitFor(() => expect(portalRead).toHaveTextContent('0'), {
    timeout: INTERACTION_TIMEOUT,
  });
  await waitForGeometryTrackerToIdle();

  body.getByRole('region', { name: 'Portal scroller' }).scrollTop =
    HOST_SCROLL_TOP;
  await waitForGeometryTrackerToIdle();

  await userEvent.click(readPortalButton);
  await waitFor(
    () => expect(portalRead).toHaveTextContent(String(HOST_SCROLL_TOP)),
    { timeout: INTERACTION_TIMEOUT },
  );
  await expect(errorHandler).not.toHaveBeenCalled();
};
