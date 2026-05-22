import { type within } from 'storybook/test';

import { MOUNT_TIMEOUT } from '../probe-timeouts';

type Canvas = ReturnType<typeof within>;

export const expectProbeReady = async (canvas: Canvas): Promise<void> => {
  await canvas.findByTestId('probe-ready', {}, { timeout: MOUNT_TIMEOUT });
};
