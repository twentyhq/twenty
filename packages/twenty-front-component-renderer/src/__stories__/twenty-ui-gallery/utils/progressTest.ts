import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const progressTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const importProgress = canvas.getByRole('progressbar', {
    name: 'Importing records',
  });
  const storageProgress = canvas.getByRole('progressbar', {
    name: 'Storage',
  });

  expect(importProgress).toHaveAttribute('aria-valuenow', '25');
  expect(importProgress).toHaveAttribute('aria-valuemin', '0');
  expect(importProgress).toHaveAttribute('aria-valuemax', '100');
  expect(importProgress).toHaveAttribute('aria-valuetext', '25 of 100 records');
  expect(storageProgress).toHaveAttribute('aria-valuenow', '25');
  expect(storageProgress).toHaveAttribute('aria-valuetext', '25 / 100 GB');
  expect(canvas.getByText('25 / 100 GB')).toBeVisible();
  expect(canvas.getByText('0')).toBeVisible();
  expect(canvas.getAllByRole('progressbar')).toHaveLength(4);
  expect(
    canvas.getByRole('progressbar', { name: 'Empty progress' }),
  ).toHaveAttribute('aria-valuenow', '0');
  expect(
    canvas.getByRole('progressbar', { name: 'Complete progress' }),
  ).toHaveAttribute('aria-valuenow', '100');

  await userEvent.click(
    canvas.getByRole('button', { name: 'Advance progress' }),
  );

  await waitFor(() => {
    expect(importProgress).toHaveAttribute('aria-valuenow', '75');
    expect(importProgress).toHaveAttribute(
      'aria-valuetext',
      '75 of 100 records',
    );
    expect(storageProgress).toHaveAttribute('aria-valuenow', '75');
    expect(storageProgress).toHaveAttribute('aria-valuetext', '75 / 100 GB');
    expect(canvas.getByText('75 / 100 GB')).toBeVisible();
  });
  expect(errorHandler).not.toHaveBeenCalled();
};
