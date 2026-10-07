import { userEvent, type within } from 'storybook/test';

type Canvas = ReturnType<typeof within>;

export const showAutocompleteEmptyAnnouncement = async (
  canvas: Canvas,
): Promise<HTMLElement> => {
  await userEvent.click(
    canvas.getByRole('button', { name: 'Show empty announcement' }),
  );

  return canvas.findByRole('status', { name: 'Empty announcement' });
};
