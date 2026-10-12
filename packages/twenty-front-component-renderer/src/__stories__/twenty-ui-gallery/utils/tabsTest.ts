import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectAssertionToKeepFailing } from '@/__stories__/twenty-ui-gallery/utils/expectAssertionToKeepFailing';

export const tabsTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const overviewTab = canvas.getByRole('tab', { name: 'Overview' });
  const activityTab = canvas.getByRole('tab', { name: 'Activity' });
  const unavailableTab = canvas.getByRole('tab', { name: 'Unavailable' });
  expect(overviewTab).toHaveAttribute('aria-selected', 'true');
  expect(unavailableTab).toHaveAttribute('aria-disabled', 'true');
  expect(canvas.getByRole('status')).toHaveTextContent('Section: overview');

  await userEvent.click(activityTab);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Section: activity'),
  );
  expect(activityTab).toHaveAttribute('aria-selected', 'true');
  expect(overviewTab).toHaveAttribute('aria-selected', 'false');
  expect(canvas.getByText('Recent activity')).toBeVisible();

  await userEvent.click(unavailableTab);
  await expectAssertionToKeepFailing(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Section: disabled'),
  );
  expect(activityTab).toHaveAttribute('aria-selected', 'true');
  expect(errorHandler).not.toHaveBeenCalled();
};
