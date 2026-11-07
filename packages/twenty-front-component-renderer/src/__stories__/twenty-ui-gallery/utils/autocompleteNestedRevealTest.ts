import { expect, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectElementWithinScrollport } from '@/__stories__/shared/test-utils/matchers/expectElementWithinScrollport';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { focusWithoutScrolling } from '@/__stories__/twenty-ui-gallery/utils/focusWithoutScrolling';
import { pressKeyUntilOptionHighlightedOrThrow } from '@/__stories__/twenty-ui-gallery/utils/pressKeyUntilOptionHighlightedOrThrow';
import { readHostScrollBoundary } from '@/__stories__/twenty-ui-gallery/utils/readHostScrollBoundary';

export const autocompleteNestedRevealTest: TwentyUiGalleryPlayFunction =
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectFrontComponentMounted(canvas);

    const input = canvas.getByLabelText('Inline option search');
    const list = canvas.getByRole('listbox', { name: 'Inline options' });
    const outerScroller = canvas.getByRole('region', {
      name: 'Owned outer scroller',
    });

    await focusWithoutScrolling(input);

    const hostScrollBoundaryBeforeReveal =
      readHostScrollBoundary(canvasElement);

    await pressKeyUntilOptionHighlightedOrThrow({
      key: '{ArrowUp}',
      findOption: () => canvas.queryByRole('option', { name: 'Option 40' }),
    });

    const lastOption = canvas.getByRole('option', { name: 'Option 40' });

    await waitFor(
      () => {
        expect(list.scrollTop).toBeGreaterThan(0);
        expect(outerScroller.scrollTop).toBeGreaterThan(0);
        expectElementWithinScrollport({
          element: lastOption,
          scrollContainer: list,
        });
        expectElementWithinScrollport({
          element: lastOption,
          scrollContainer: outerScroller,
        });
      },
      { timeout: INTERACTION_TIMEOUT },
    );
    await expect(readHostScrollBoundary(canvasElement)).toEqual(
      hostScrollBoundaryBeforeReveal,
    );
    await expect(errorHandler).not.toHaveBeenCalled();
  };
