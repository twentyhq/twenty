import { expect, userEvent, waitFor } from 'storybook/test';

const HIGHLIGHT_SETTLE_TIMEOUT = 1500;

export const pressKeyUntilOptionHighlightedOrThrow = async ({
  key,
  findOption,
  maximumKeyPresses = 3,
}: {
  key: string;
  findOption: () => Element | null;
  maximumKeyPresses?: number;
}): Promise<void> => {
  for (
    let keyPressCount = 0;
    keyPressCount < maximumKeyPresses;
    keyPressCount += 1
  ) {
    await userEvent.keyboard(key);

    const isOptionHighlighted = await waitFor(
      () => expect(findOption()).toHaveAttribute('data-highlighted'),
      { timeout: HIGHLIGHT_SETTLE_TIMEOUT },
    ).then(
      () => true,
      () => false,
    );

    if (isOptionHighlighted) {
      return;
    }
  }

  throw new Error(`${key} never highlighted the expected option`);
};
