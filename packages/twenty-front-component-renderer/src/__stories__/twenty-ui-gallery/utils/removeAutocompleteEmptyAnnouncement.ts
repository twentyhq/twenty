import { expect, userEvent, waitFor, type within } from 'storybook/test';

type Canvas = ReturnType<typeof within>;

type RemoveAutocompleteEmptyAnnouncementParams = {
  canvas: Canvas;
  announcement: HTMLElement;
};

export const removeAutocompleteEmptyAnnouncement = async ({
  canvas,
  announcement,
}: RemoveAutocompleteEmptyAnnouncementParams): Promise<void> => {
  await userEvent.click(
    canvas.getByRole('button', { name: 'Remove empty announcement' }),
  );
  await waitFor(() => expect(announcement).not.toBeInTheDocument());
};
