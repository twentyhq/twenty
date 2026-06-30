import { expect, waitFor, type within } from 'storybook/test';

import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

type Canvas = ReturnType<typeof within>;

type ExpectAttributesParams = {
  canvas: Canvas;
  attributes: Record<string, string>;
  timeout?: number;
};

export const expectAttributesReflected = async ({
  canvas,
  attributes,
  timeout = INTERACTION_TIMEOUT,
}: ExpectAttributesParams): Promise<void> => {
  await waitFor(
    () => {
      const subject = canvas.queryByTestId('subject');

      expect(subject).not.toBeNull();

      for (const [attributeName, expectedValue] of Object.entries(attributes)) {
        const actualValue = subject?.getAttribute(attributeName);

        expect(
          actualValue,
          `Attribute "${attributeName}" expected "${expectedValue}" but received "${actualValue}"`,
        ).toBe(expectedValue);
      }
    },
    { timeout },
  );
};

type ExpectPropertiesParams = {
  canvas: Canvas;
  properties: Record<string, string | number | boolean>;
  timeout?: number;
};

export const expectPropertiesReflected = async ({
  canvas,
  properties,
  timeout = INTERACTION_TIMEOUT,
}: ExpectPropertiesParams): Promise<void> => {
  await waitFor(
    () => {
      const subject = canvas.queryByTestId('subject');

      expect(subject).not.toBeNull();

      const subjectRecord = subject as unknown as Record<string, unknown>;

      for (const [name, expectedValue] of Object.entries(properties)) {
        expect(subjectRecord[name]).toBe(expectedValue);
      }
    },
    { timeout },
  );
};
