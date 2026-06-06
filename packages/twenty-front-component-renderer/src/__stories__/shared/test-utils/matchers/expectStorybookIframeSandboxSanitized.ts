import { expect, waitFor, type within } from 'storybook/test';

import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

type Canvas = ReturnType<typeof within>;

const SANDBOX_DENYLIST = [
  'allow-same-origin',
  'allow-top-navigation',
  'allow-top-navigation-by-user-activation',
  'allow-top-navigation-to-custom-protocols',
  'allow-popups-to-escape-sandbox',
];

type ExpectStorybookIframeSandboxSanitizedParams = {
  canvas: Canvas;
  timeout?: number;
};

export const expectStorybookIframeSandboxSanitized = async ({
  canvas,
  timeout = INTERACTION_TIMEOUT,
}: ExpectStorybookIframeSandboxSanitizedParams): Promise<void> => {
  await waitFor(
    () => {
      const subject = canvas.queryByTestId('subject');

      expect(subject).not.toBeNull();

      const sandbox = subject?.getAttribute('sandbox') ?? '';
      const tokens = new Set(sandbox.split(/\s+/).filter(Boolean));

      expect(
        tokens.has('allow-scripts'),
        `Expected sandbox to keep "allow-scripts" but received "${sandbox}"`,
      ).toBe(true);

      for (const deniedToken of SANDBOX_DENYLIST) {
        expect(
          tokens.has(deniedToken),
          `Expected sandbox to strip "${deniedToken}" but received "${sandbox}"`,
        ).toBe(false);
      }
    },
    { timeout },
  );
};
