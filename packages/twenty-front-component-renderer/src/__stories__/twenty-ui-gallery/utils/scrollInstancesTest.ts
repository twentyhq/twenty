import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import {
  INTERACTION_TIMEOUT,
  MOUNT_TIMEOUT,
} from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { waitForGeometryTrackerToIdle } from '@/__stories__/twenty-ui-gallery/utils/waitForGeometryTrackerToIdle';

const revealRowInRenderer = async (renderer: HTMLElement) => {
  await userEvent.click(
    within(renderer).getByRole('button', { name: 'Reveal row 25' }),
  );
};

const readInnerScroller = (renderer: HTMLElement) =>
  within(renderer).getByRole('region', { name: 'Inner scroller' });

export const scrollInstancesTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);

  await waitFor(
    () =>
      expect(canvas.getAllByTestId('front-component-mounted')).toHaveLength(2),
    { timeout: MOUNT_TIMEOUT },
  );

  const firstRenderer = canvas.getByRole('group', { name: 'First renderer' });
  const secondRenderer = canvas.getByRole('group', { name: 'Second renderer' });

  await revealRowInRenderer(firstRenderer);
  await waitFor(
    () => expect(readInnerScroller(firstRenderer).scrollTop).toBeGreaterThan(0),
    { timeout: INTERACTION_TIMEOUT },
  );
  await waitForGeometryTrackerToIdle();
  await expect(readInnerScroller(secondRenderer).scrollTop).toBe(0);

  await userEvent.click(
    canvas.getByRole('button', { name: 'Remove first renderer' }),
  );
  await waitFor(
    () =>
      expect(canvas.getAllByTestId('front-component-mounted')).toHaveLength(1),
    { timeout: INTERACTION_TIMEOUT },
  );

  await revealRowInRenderer(secondRenderer);
  await waitFor(
    () =>
      expect(readInnerScroller(secondRenderer).scrollTop).toBeGreaterThan(0),
    { timeout: INTERACTION_TIMEOUT },
  );
  await expect(errorHandler).not.toHaveBeenCalled();
};
