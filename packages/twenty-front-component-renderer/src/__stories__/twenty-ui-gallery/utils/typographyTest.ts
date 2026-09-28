import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { galleryRenderTest } from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';

export const typographyTest: TwentyUiGalleryPlayFunction = async (context) => {
  await galleryRenderTest(context);
  const canvas = within(context.canvasElement);

  await expect(
    canvas.getByRole('heading', { level: 1, name: 'Heading 1' }),
  ).toHaveAttribute('data-size', 'lg');
  await expect(
    canvas.getByRole('heading', { level: 3, name: 'Heading 3' }),
  ).toHaveAttribute('data-size', 'sm');
  await expect(
    canvas.getByRole('heading', { level: 2, name: 'Workspace preferences' }),
  ).toHaveAccessibleDescription('Manage the settings for your workspace.');

  const button = canvas.getByRole('button', { name: 'Edit workspace' });
  await userEvent.click(button);
  await waitFor(() =>
    expect(canvas.getByLabelText('Workspace edits')).toHaveTextContent('1'),
  );
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByLabelText('Workspace edits')).toHaveTextContent('2'),
  );
};
