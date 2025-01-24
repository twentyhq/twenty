import { Meta, StoryObj } from '@storybook/react';

import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { CancelButton } from '../SaveAndCancelButtons/CancelButton';

const meta: Meta<typeof CancelButton> = {
  title: 'Modules/Settings/CancelButton',
  component: CancelButton,
  decorators: [I18nFrontDecorator],
};

export default meta;
type Story = StoryObj<typeof CancelButton>;

export const Default: Story = {
  argTypes: {
    onCancel: { control: false },
  },
  args: {
    onCancel: () => {},
  },
};
