import { userEvent } from 'storybook/test';

export const pressKeyboardKeys = async ({
  keys,
  isTrusted,
}: {
  keys: string;
  isTrusted: boolean;
}): Promise<void> => {
  if (!isTrusted) {
    await userEvent.keyboard(keys);
    return;
  }

  const { userEvent: trustedUserEvent } = await import('vitest/browser');

  await trustedUserEvent.keyboard(keys);
};
