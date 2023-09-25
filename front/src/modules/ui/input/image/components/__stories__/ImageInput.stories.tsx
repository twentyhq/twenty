import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { workspaceLogoUrl } from '~/testing/mock-data/users';

import { ImageInput } from '../ImageInput';

const meta: Meta<typeof ImageInput> = {
  title: 'UI/Input/ImageInput',
  component: ImageInput,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof ImageInput>;

export const Default: Story = {};

export const WithPicture: Story = { args: { picture: workspaceLogoUrl } };

export const Disabled: Story = { args: { disabled: true } };
