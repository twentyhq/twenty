import { type Meta, type StoryObj } from '@storybook/react-vite';

import { workspaceLogoUrl } from '~/testing/mock-data/users';

import { ImageInput } from '@/ui/input/components/ImageInput';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof ImageInput> = {
  title: 'UI/Input/ImageInput/ImageInput',
  component: ImageInput,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof ImageInput>;

export const Default: Story = {};

export const WithPicture: Story = { args: { picture: workspaceLogoUrl } };

export const Disabled: Story = { args: { disabled: true } };
