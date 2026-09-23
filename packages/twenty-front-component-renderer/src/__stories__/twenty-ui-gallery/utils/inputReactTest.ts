import { expect, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createGalleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/createGalleryRenderTest';

const SEGMENTED_CONTROL_ORDERING_ERROR =
  /SegmentedControl: \w+\.compareDocumentPosition is not a function(?: \| |$)/;

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
