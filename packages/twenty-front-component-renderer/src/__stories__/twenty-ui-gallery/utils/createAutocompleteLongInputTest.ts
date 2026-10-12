import { expect, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { LONG_INPUT_VALUES } from '@/__stories__/twenty-ui-gallery/constants/LongInputValues';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectCaretAt } from '@/__stories__/twenty-ui-gallery/utils/expectCaretAt';
import { expectInputScrolledToEdge } from '@/__stories__/twenty-ui-gallery/utils/expectInputScrolledToEdge';
import { focusWithoutScrolling } from '@/__stories__/twenty-ui-gallery/utils/focusWithoutScrolling';
import { pressKeyboardKeys } from '@/__stories__/twenty-ui-gallery/utils/pressKeyboardKeys';

const LONG_INPUTS = [
  {
    label: 'Long value',
    value: LONG_INPUT_VALUES.leftToRight,
    isRightToLeft: false,
  },
  {
    label: 'Long value RTL',
    value: LONG_INPUT_VALUES.rightToLeft,
    isRightToLeft: true,
  },
];

export const createAutocompleteLongInputTest =
  ({ isTrusted }: { isTrusted: boolean }): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectFrontComponentMounted(canvas);

    for (const { label, value, isRightToLeft } of LONG_INPUTS) {
      const input = canvas.getByLabelText<HTMLInputElement>(label);

      await focusWithoutScrolling(input);
      await pressKeyboardKeys({ keys: '{End}', isTrusted });
      await expectCaretAt({ input, offset: value.length });
      await expectInputScrolledToEdge({ input, edge: 'end', isRightToLeft });

      await pressKeyboardKeys({ keys: '{Home}', isTrusted });
      await expectCaretAt({ input, offset: 0 });
      await expectInputScrolledToEdge({
        input,
        edge: 'start',
        isRightToLeft,
      });
    }

    await expect(errorHandler).not.toHaveBeenCalled();
  };
