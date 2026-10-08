import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const imageInputTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const imageInput = await canvas.findByLabelText(
    'Profile image',
    {},
    { timeout: 10000 },
  );
  const input = within(imageInput);
  const actions = canvas.getByLabelText('Image actions');

  await expect(
    input.getByText('Choose an image for your profile.'),
  ).toBeVisible();
  await expect(input.queryByRole('alert')).not.toBeInTheDocument();
  await userEvent.click(
    canvas.getByRole('button', { name: 'Show upload error' }),
  );
  await expect(await input.findByRole('alert')).toHaveTextContent(
    'The image could not be uploaded.',
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Clear upload error' }),
  );
  await waitFor(() =>
    expect(input.queryByRole('alert')).not.toBeInTheDocument(),
  );
  await waitFor(() => {
    expect(input.getByRole('presentation')).toHaveProperty('naturalWidth', 40);
  });

  await userEvent.click(
    canvas.getByRole('button', { name: 'Show invalid image' }),
  );
  await waitFor(() =>
    expect(input.queryByRole('presentation')).not.toBeInTheDocument(),
  );
  await userEvent.click(canvas.getByRole('button', { name: 'Restore image' }));
  await waitFor(() => {
    expect(input.getByRole('presentation')).toHaveProperty('naturalWidth', 40);
  });

  for (const activation of ['pointer', 'Enter', 'Space']) {
    const remove = input.getByRole('button', {
      name: 'Remove profile image',
    });

    await expect(remove).toHaveAttribute('type', 'button');
    if (activation === 'pointer') {
      await userEvent.click(remove);
    }
    if (activation !== 'pointer') {
      remove.focus();
      await userEvent.keyboard(activation === 'Enter' ? '{Enter}' : ' ');
    }
    await waitFor(() => expect(remove).toBeDisabled());
    await expect(input.queryByRole('presentation')).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Restore image' }),
    );
    await waitFor(() => expect(remove).toBeEnabled());
  }
  await expect(actions).toHaveTextContent('Uploads: 0; Removals: 3; Aborts: 0');

  await userEvent.click(
    canvas.getByRole('button', { name: 'Disable image input' }),
  );
  await waitFor(() => {
    for (const button of input.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
  });
  await userEvent.click(
    input.getByRole('button', { name: 'Remove profile image' }),
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Enable image input' }),
  );
  await waitFor(() => {
    for (const button of input.getAllByRole('button')) {
      expect(button).toBeEnabled();
    }
  });
  await expect(actions).toHaveTextContent('Removals: 3');

  await userEvent.click(canvas.getByRole('button', { name: 'Start upload' }));
  const abort = await input.findByRole('button', {
    name: 'Cancel profile upload',
  });

  await expect(abort).toHaveAttribute('type', 'button');
  await expect(abort).toBeEnabled();
  for (const button of input.getAllByRole('button', {
    name: 'Choose profile image',
  })) {
    await expect(button).toHaveAttribute('aria-disabled', 'true');
  }
  await userEvent.click(abort);
  await waitFor(() => expect(actions).toHaveTextContent('Aborts: 1'));
  await userEvent.click(
    input.getByRole('button', { name: 'Remove profile image' }),
  );
  await userEvent.click(canvas.getByRole('button', { name: 'Start upload' }));
  const emptyAbort = await input.findByRole('button', {
    name: 'Cancel profile upload',
  });

  emptyAbort.focus();
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(actions).toHaveTextContent('Aborts: 2'));
  await expect(input.queryByRole('presentation')).not.toBeInTheDocument();

  const fileInput = imageInput.querySelector('input[type="file"]');

  if (!(fileInput instanceof HTMLInputElement)) {
    throw new Error('ImageInput must render a native file input');
  }

  await expect(fileInput).toHaveAttribute('accept', 'image/*');
  await expect(fileInput).not.toBeVisible();
  await userEvent.upload(
    fileInput,
    new File(['image'], 'profile.png', { type: 'image/png' }),
  );
  await waitFor(() => expect(actions).toHaveTextContent('Uploads: 1'));
  await expect(canvas.getByLabelText('Selected image')).toHaveTextContent(
    'profile.png; image/png; 5 bytes',
  );
};
