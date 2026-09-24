import { expect, within } from 'storybook/test';

import { SEGMENTED_CONTROL_ORDERING_ERROR } from '@/__stories__/twenty-ui-gallery/constants/SEGMENTED_CONTROL_ORDERING_ERROR';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createGalleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/createGalleryRenderTest';

export const inputReactTest: TwentyUiGalleryPlayFunction = async (context) => {
  await createGalleryRenderTest({
    expectedFailedComponents: ['Radio', 'RadioGroup', 'SegmentedControl'],
  })(context);

  expect(
    within(context.canvasElement).getByTestId('gallery-status'),
  ).toHaveAttribute(
    'data-failed-messages',
    expect.stringMatching(SEGMENTED_CONTROL_ORDERING_ERROR),
  );
};
