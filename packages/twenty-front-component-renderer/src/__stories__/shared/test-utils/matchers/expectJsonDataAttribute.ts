import { expect, waitFor, type within } from 'storybook/test';

import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

type Canvas = ReturnType<typeof within>;

type ExpectJsonDataAttributeParams = {
  canvas: Canvas;
  testId: string;
  attributeName: string;
  expectedValue: unknown;
  timeout?: number;
};

export const expectJsonDataAttribute = async ({
  canvas,
  testId,
  attributeName,
  expectedValue,
  timeout = INTERACTION_TIMEOUT,
}: ExpectJsonDataAttributeParams): Promise<void> => {
  await waitFor(
    () => {
      expect(
        JSON.parse(
          canvas.getByTestId(testId).getAttribute(attributeName) ?? 'null',
        ),
      ).toEqual(expectedValue);
    },
    { timeout },
  );
};
