import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const tabsTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const overview = canvas.getByRole('tab', { name: 'Overview' });
  const activity = canvas.getByRole('tab', { name: 'Activity' });
  const unavailable = canvas.getByRole('tab', { name: 'Unavailable' });
  expect(overview).toHaveAttribute('aria-selected', 'true');
  expect(unavailable).toHaveAttribute('aria-disabled', 'true');
  expect(canvas.getByRole('status')).toHaveTextContent('Section: overview');

  await userEvent.click(activity);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Section: activity'),
  );
  expect(activity).toHaveAttribute('aria-selected', 'true');
  expect(overview).toHaveAttribute('aria-selected', 'false');
  expect(canvas.getByText('Recent activity')).toBeVisible();

  await userEvent.click(unavailable);
  await expect(
    waitFor(
      () =>
        expect(canvas.getByRole('status')).toHaveTextContent(
          'Section: disabled',
        ),
      { timeout: INTERACTION_TIMEOUT },
    ),
  ).rejects.toThrow();
  expect(activity).toHaveAttribute('aria-selected', 'true');
  expect(errorHandler).not.toHaveBeenCalled();
};
