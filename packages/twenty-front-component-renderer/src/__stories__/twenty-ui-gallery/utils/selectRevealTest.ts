import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectElementWithinScrollport } from '@/__stories__/shared/test-utils/matchers/expectElementWithinScrollport';
import { expectFocusedElementWithinScrollport } from '@/__stories__/shared/test-utils/matchers/expectFocusedElementWithinScrollport';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { findScrollContainerOrThrow } from '@/__stories__/twenty-ui-gallery/utils/findScrollContainerOrThrow';
import { openSelectListbox } from '@/__stories__/twenty-ui-gallery/utils/openSelectListbox';

const KEYBOARD_STEPS = [
  { key: '{End}', optionName: 'Option 40' },
  { key: '{ArrowUp}', optionName: 'Option 39' },
  { key: '{ArrowUp}', optionName: 'Option 38' },
  { key: '{Home}', optionName: 'Option 01' },
  { key: '{ArrowDown}', optionName: 'Option 02' },
];

export const selectRevealTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);

  await openSelectListbox({ canvas, body, selectName: 'Unaligned option' });
  await waitFor(
    () => {
      const selectedOption = body.getByRole('option', { name: 'Option 30' });

      expectElementWithinScrollport({
        element: selectedOption,
        scrollContainer: findScrollContainerOrThrow(selectedOption),
      });
    },
    { timeout: INTERACTION_TIMEOUT },
  );

  for (const { key, optionName } of KEYBOARD_STEPS) {
    await userEvent.keyboard(key);
    await expectFocusedElementWithinScrollport({
      findElement: () => body.getByRole('option', { name: optionName }),
      findScrollContainer: findScrollContainerOrThrow,
    });
  }

  await userEvent.keyboard('{Escape}');
  await expect(errorHandler).not.toHaveBeenCalled();
};
