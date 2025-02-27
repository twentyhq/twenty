import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui';

import { Roles } from '@/settings/roles/components/Roles';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { getRolesMock } from '~/testing/mock-data/roles';

const meta: Meta<typeof Roles> = {
  title: 'Modules/Settings/Roles/Roles',
  component: Roles,
  decorators: [ComponentDecorator, I18nFrontDecorator, RouterDecorator],
  parameters: {
    maxWidth: 800,
  },
};

export default meta;
type Story = StoryObj<typeof Roles>;

export const Default: Story = {
  args: {
    roles: getRolesMock(),
  },
};
