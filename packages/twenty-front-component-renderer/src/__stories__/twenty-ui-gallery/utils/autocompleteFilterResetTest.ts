import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { focusWithoutScrolling } from '@/__stories__/twenty-ui-gallery/utils/focusWithoutScrolling';
import { pressKeyUntilOptionHighlightedOrThrow } from '@/__stories__/twenty-ui-gallery/utils/pressKeyUntilOptionHighlightedOrThrow';
import { waitForGeometryTrackerToIdle } from '@/__stories__/twenty-ui-gallery/utils/waitForGeometryTrackerToIdle';
import { SCROLLING_OPTION_LABELS } from '@/__stories__/twenty-ui-gallery/constants/ScrollingOptionLabels';

export const autocompleteFilterResetTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const input = canvas.getByLabelText('Inline option search');
  const list = canvas.getByRole('listbox', { name: 'Inline options' });
  const outerScroller = canvas.getByRole('region', {
    name: 'Owned outer scroller',
  });

  await focusWithoutScrolling(input);
  await pressKeyUntilOptionHighlightedOrThrow({
    key: '{ArrowUp}',
    findOption: () => canvas.queryByRole('option', { name: 'Option 40' }),
  });

  list.scrollTop = list.scrollHeight;
  await waitFor(() => expect(list.scrollTop).toBeGreaterThan(0), {
    timeout: INTERACTION_TIMEOUT,
  });

  await waitForGeometryTrackerToIdle();

  const outerScrollTopBeforeFiltering = outerScroller.scrollTop;

  await userEvent.keyboard('o');

  await waitFor(
    () =>
      expect(
        canvas.getByRole('status', { name: 'Inline query' }),
      ).toHaveTextContent('o'),
    { timeout: INTERACTION_TIMEOUT },
  );
  await expect(within(list).getAllByRole('option')).toHaveLength(
    SCROLLING_OPTION_LABELS.length,
  );
  await waitFor(() => expect(list.scrollTop).toBe(0), {
    timeout: INTERACTION_TIMEOUT,
  });
  await expect(outerScroller.scrollTop).toBe(outerScrollTopBeforeFiltering);
  await expect(errorHandler).not.toHaveBeenCalled();
};
