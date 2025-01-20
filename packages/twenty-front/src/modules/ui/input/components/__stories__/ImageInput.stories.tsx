import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { workspaceLogoUrl } from '~/testing/mock-data/users';

import { ImageInput } from '../ImageInput';

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
