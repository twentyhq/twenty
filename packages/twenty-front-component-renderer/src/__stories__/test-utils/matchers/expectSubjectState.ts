import { expect, waitFor, type within } from 'storybook/test';

import { INTERACTION_TIMEOUT } from '../probe-timeouts';

type Canvas = ReturnType<typeof within>;

type ExpectSubjectStateParams = {
  canvas: Canvas;
  expected: string;
  timeout?: number;
};

export const expectSubjectState = async ({
  canvas,
  expected,
  timeout = INTERACTION_TIMEOUT,
}: ExpectSubjectStateParams): Promise<void> => {
  await waitFor(
    () => {
      const state = canvas.queryByTestId('subject-state');

      expect(state).not.toBeNull();
      expect(state?.textContent).toBe(expected);
    },
    { timeout },
  );
};
