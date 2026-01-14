import { type Meta, type StoryObj } from '@storybook/react-vite';

import { CancelButton } from '@/settings/components/SaveAndCancelButtons/CancelButton';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

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
