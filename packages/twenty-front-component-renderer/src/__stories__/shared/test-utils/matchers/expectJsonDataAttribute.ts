import { expect, waitFor, type within } from 'storybook/test';

import { MOUNT_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

type ExpectJsonDataAttributeParams = {
  canvas: ReturnType<typeof within>;
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
  timeout = MOUNT_TIMEOUT,
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
