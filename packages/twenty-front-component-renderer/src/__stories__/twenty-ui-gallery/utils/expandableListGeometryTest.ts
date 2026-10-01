import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const expandableListGeometryTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const trigger = await canvas.findByRole('button', {
    name: /Show all measured items$/,
  });
  await waitFor(() => expect(trigger).toHaveTextContent('+3'));
  await expect(
    canvas.getByRole('button', { name: 'Measured Alpha' }),
  ).toBeVisible();
  await expect(
    canvas.queryByRole('button', { name: 'Measured Delta' }),
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
  await expect(errorHandler).not.toHaveBeenCalled();
};
