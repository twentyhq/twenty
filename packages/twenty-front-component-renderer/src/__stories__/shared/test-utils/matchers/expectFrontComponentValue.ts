import { expect, waitFor, type within } from 'storybook/test';

import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

type Canvas = ReturnType<typeof within>;

type ExpectFrontComponentValueParams = {
  canvas: Canvas;
  expected: string;
  timeout?: number;
};

export const expectFrontComponentValue = async ({
  canvas,
  expected,
  timeout = INTERACTION_TIMEOUT,
}: ExpectFrontComponentValueParams): Promise<void> => {
  await waitFor(
    () => {
      const valueElement = canvas.queryByTestId('front-component-value');

      expect(valueElement).not.toBeNull();
      expect(valueElement?.textContent).toBe(expected);
    },
    { timeout },
  );
};
