import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { waitForAnimationFrames } from '@/__stories__/shared/test-utils/waitForAnimationFrames';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { GEOMETRY_IDLE_FRAME_THRESHOLD } from '@/host/geometry/constants/GeometryIdleFrameThreshold';

export const overflowingListGeometryTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const trigger = await canvas.findByRole('button', {
    name: /Show all measured items$/,
  });
  await waitFor(() => expect(trigger).toHaveTextContent('+2'));
  await expect(
    canvas.getByRole('button', { name: 'Measured Alpha' }),
  ).toBeVisible();
  await expect(
    canvas.getByRole('button', { name: 'Measured Bravo' }),
  ).toBeInTheDocument();
  await expect(
    canvas.queryByRole('button', { name: 'Measured Charlie' }),
  ).toBeNull();

  await userEvent.click(
    canvas.getByRole('button', { name: 'Fit one measured item' }),
  );
  await waitFor(() =>
    expect(
      canvas
        .getByRole('group', { name: 'Measured list' })
        .getBoundingClientRect().width,
    ).toBe(208),
  );
  await waitForAnimationFrames(GEOMETRY_IDLE_FRAME_THRESHOLD * 2);
  await expect(
    canvas.getByRole('button', { name: /Show all measured items$/ }),
  ).toHaveTextContent('+2');
  await expect(
    canvas.getByRole('button', { name: 'Measured Bravo' }),
  ).toBeVisible();
  await expect(
    canvas.queryByRole('button', { name: 'Measured Charlie' }),
  ).toBeNull();

  await userEvent.click(
    canvas.getByRole('button', { name: 'Widen measured list' }),
  );
  await waitFor(() =>
    expect(
      canvas.queryByRole('button', { name: /Show all measured items$/ }),
    ).toBeNull(),
  );
  await expect(
    canvas.getByRole('button', { name: 'Measured Delta' }),
  ).toBeVisible();

  await userEvent.click(
    canvas.getByRole('button', { name: 'Narrow measured list' }),
  );
  await waitFor(() =>
    expect(
      canvas.getByRole('button', { name: /Show all measured items$/ }),
    ).toHaveTextContent('+1'),
  );
  await expect(
    canvas.getByRole('button', { name: 'Measured Charlie' }),
  ).toBeInTheDocument();
  await expect(
    canvas.queryByRole('button', { name: 'Measured Delta' }),
  ).toBeNull();

  await userEvent.click(
    canvas.getByRole('button', { name: 'Remove measured list' }),
  );
  await waitFor(() =>
    expect(canvas.queryByRole('button', { name: 'Measured Alpha' })).toBeNull(),
  );
  await userEvent.click(canvas.getByRole('button', { name: 'Add target' }));
  await waitFor(() =>
    expect(
      canvas.getByRole('button', { name: /Show all targets$/ }),
    ).toHaveTextContent('+3'),
  );
  await expect(errorHandler).not.toHaveBeenCalled();
};
