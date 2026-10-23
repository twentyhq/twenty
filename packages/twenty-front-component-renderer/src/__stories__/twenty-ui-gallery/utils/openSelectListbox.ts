import { expect, userEvent, waitFor, type within } from 'storybook/test';

import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';

type Canvas = ReturnType<typeof within>;

export const openSelectListbox = async ({
  canvas,
  body,
  selectName,
}: {
  canvas: Canvas;
  body: Canvas;
  selectName: string;
}): Promise<void> => {
  await userEvent.click(canvas.getByRole('combobox', { name: selectName }));

  const listbox = await body.findByRole(
    'listbox',
    { name: `${selectName} options` },
    { timeout: INTERACTION_TIMEOUT },
  );

  await waitFor(() => expect(listbox).toBeVisible(), {
    timeout: INTERACTION_TIMEOUT,
  });
};
