import { expect, waitFor } from 'storybook/test';

import { expectElementWithinScrollport } from '@/__stories__/shared/test-utils/matchers/expectElementWithinScrollport';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

export const expectFocusedElementWithinScrollport = ({
  findElement,
  findScrollContainer,
}: {
  findElement: () => HTMLElement;
  findScrollContainer: (element: HTMLElement) => Element;
}): Promise<void> =>
  waitFor(
    () => {
      const element = findElement();

      expect(element).toHaveFocus();
      expectElementWithinScrollport({
        element,
        scrollContainer: findScrollContainer(element),
      });
    },
    { timeout: INTERACTION_TIMEOUT },
  );
