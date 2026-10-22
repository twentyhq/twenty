import { expect, waitFor } from 'storybook/test';

import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

const SCROLL_EDGE_TOLERANCE = 1;

export const expectInputScrolledToEdge = async ({
  input,
  edge,
  isRightToLeft,
}: {
  input: HTMLInputElement;
  edge: 'start' | 'end';
  isRightToLeft: boolean;
}): Promise<void> => {
  await waitFor(
    () => {
      const maximumScrollOffset = input.scrollWidth - input.clientWidth;
      const endScrollOffset = isRightToLeft
        ? -maximumScrollOffset
        : maximumScrollOffset;
      const expectedScrollOffset = edge === 'start' ? 0 : endScrollOffset;

      expect(maximumScrollOffset).toBeGreaterThan(0);
      expect(
        Math.abs(input.scrollLeft - expectedScrollOffset),
      ).toBeLessThanOrEqual(SCROLL_EDGE_TOLERANCE);
    },
    { timeout: INTERACTION_TIMEOUT },
  );
};
