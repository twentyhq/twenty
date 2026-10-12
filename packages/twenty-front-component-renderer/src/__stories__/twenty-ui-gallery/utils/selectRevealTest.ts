import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectElementWithinScrollport } from '@/__stories__/shared/test-utils/matchers/expectElementWithinScrollport';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { findScrollContainer } from '@/__stories__/twenty-ui-gallery/utils/findScrollContainer';

const KEYBOARD_STEPS = [
  { key: '{End}', optionName: 'Option 40' },
  { key: '{ArrowUp}', optionName: 'Option 39' },
  { key: '{ArrowUp}', optionName: 'Option 38' },
  { key: '{Home}', optionName: 'Option 01' },
  { key: '{ArrowDown}', optionName: 'Option 02' },
];

const expectOptionWithinScrollport = async ({
  body,
  optionName,
  isFocused,
}: {
  body: ReturnType<typeof within>;
  optionName: string;
  isFocused: boolean;
}) => {
  await waitFor(
    () => {
      const option = body.getByRole('option', { name: optionName });

      if (isFocused) {
        expect(option).toHaveFocus();
      }

      expectElementWithinScrollport({
        element: option,
        scrollContainer: findScrollContainer(option),
      });
    },
    { timeout: INTERACTION_TIMEOUT },
  );
};

export const selectRevealTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);

  await userEvent.click(
    canvas.getByRole('combobox', { name: 'Unaligned option' }),
  );

  const list = await body.findByRole(
    'listbox',
    { name: 'Unaligned option options' },
    { timeout: INTERACTION_TIMEOUT },
  );

  await waitFor(() => expect(list).toBeVisible(), {
    timeout: INTERACTION_TIMEOUT,
  });
  await expectOptionWithinScrollport({
    body,
    optionName: 'Option 30',
    isFocused: false,
  });

  for (const { key, optionName } of KEYBOARD_STEPS) {
    await userEvent.keyboard(key);
    await expectOptionWithinScrollport({ body, optionName, isFocused: true });
  }

  await userEvent.keyboard('{Escape}');
  await expect(errorHandler).not.toHaveBeenCalled();
};
