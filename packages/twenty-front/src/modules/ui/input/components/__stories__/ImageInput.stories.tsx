import { type Meta, type StoryObj } from '@storybook/react';

import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { workspaceLogoUrl } from '~/testing/mock-data/users';

import { ImageInput } from '@/ui/input/components/ImageInput';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof ImageInput> = {
  title: 'UI/Input/ImageInput/ImageInput',
  component: ImageInput,
  decorators: [ComponentDecorator, I18nFrontDecorator],
};

export default meta;
type Story = StoryObj<typeof ImageInput>;

export const Default: Story = {};

export const WithPicture: Story = { args: { picture: workspaceLogoUrl } };

export const Disabled: Story = { args: { disabled: true } };
