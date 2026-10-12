import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsImageInput } from '@/settings/components/SettingsImageInput';
import { workspaceLogoUrl } from '~/testing/mock-data/users';

const meta: Meta<typeof SettingsImageInput> = {
  title: 'Modules/Settings/SettingsImageInput',
  component: SettingsImageInput,
  decorators: [ComponentDecorator],
  args: { onFileSelect: fn(), onRemove: fn() },
};

export default meta;
type Story = StoryObj<typeof SettingsImageInput>;

export const Default: Story = {
  args: { picture: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText(
        'We support your square PNGs, JPEGs and GIFs under 10MB',
      ),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Remove' })).toBeDisabled();
    await expect(
      canvasElement.querySelector('input[type="file"]'),
    ).toHaveAttribute('accept', 'image/jpeg, image/png, image/gif');
  },
};

export const WithPicture: Story = {
  args: { picture: workspaceLogoUrl },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('presentation')).toHaveAttribute(
      'src',
      workspaceLogoUrl,
    );
    await expect(canvas.getByRole('button', { name: 'Remove' })).toBeEnabled();
  },
};

export const Uploading: Story = {
  args: { picture: workspaceLogoUrl, isUploading: true, onAbort: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Abort' })).toBeEnabled();
  },
};
