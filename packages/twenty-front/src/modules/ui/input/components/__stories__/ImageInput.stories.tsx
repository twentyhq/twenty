import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { i18nFrontDecorator } from '~/testing/decorators/i18nFrontDecorator';
import { workspaceLogoUrl } from '~/testing/mock-data/users';

import { ImageInput } from '../ImageInput';

const meta: Meta<typeof ImageInput> = {
  title: 'UI/Input/ImageInput/ImageInput',
  component: ImageInput,
  decorators: [ComponentDecorator, i18nFrontDecorator],
};

export default meta;
type Story = StoryObj<typeof ImageInput>;

export const Default: Story = {};

export const WithPicture: Story = { args: { picture: workspaceLogoUrl } };

export const Disabled: Story = { args: { disabled: true } };
