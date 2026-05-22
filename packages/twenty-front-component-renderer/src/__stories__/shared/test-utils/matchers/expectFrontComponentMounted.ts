import { type within } from 'storybook/test';

import { MOUNT_TIMEOUT } from '../timeouts';

type Canvas = ReturnType<typeof within>;

export const expectFrontComponentMounted = async (
  canvas: Canvas,
): Promise<void> => {
  await canvas.findByTestId(
    'front-component-mounted',
    {},
    { timeout: MOUNT_TIMEOUT },
  );
};
