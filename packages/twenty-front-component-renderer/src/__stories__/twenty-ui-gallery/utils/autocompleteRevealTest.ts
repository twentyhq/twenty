import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectElementWithinScrollport } from '@/__stories__/shared/test-utils/matchers/expectElementWithinScrollport';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { pressKeyUntilOptionHighlightedOrThrow } from '@/__stories__/twenty-ui-gallery/utils/pressKeyUntilOptionHighlightedOrThrow';

export const autocompleteRevealTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);

  const input = canvas.getByLabelText('Portal option search');

  await userEvent.click(input);
  await pressKeyUntilOptionHighlightedOrThrow({
    key: '{ArrowUp}',
    findOption: () => body.queryByRole('option', { name: 'Option 40' }),
  });

  const list = body.getByRole('listbox', { name: 'Portal options' });
  const lastOption = body.getByRole('option', { name: 'Option 40' });

  await expect(input).toHaveAttribute('aria-activedescendant', lastOption.id);
  await waitFor(
    () => {
      expect(list.scrollTop).toBeGreaterThan(0);
      expectElementWithinScrollport({
        element: lastOption,
        scrollContainer: list,
      });
    },
    { timeout: INTERACTION_TIMEOUT },
  );

  await pressKeyUntilOptionHighlightedOrThrow({
    key: '{ArrowDown}',
    findOption: () => body.queryByRole('option', { name: 'Option 01' }),
  });

  await waitFor(() => expect(list.scrollTop).toBe(0), {
    timeout: INTERACTION_TIMEOUT,
  });
  await expect(errorHandler).not.toHaveBeenCalled();
};
