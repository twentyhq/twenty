import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui';

import { AllRoles } from '@/settings/roles/components/AllRoles';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { getRolesMock } from '~/testing/mock-data/roles';

const meta: Meta<typeof AllRoles> = {
  title: 'Modules/Settings/Roles/AllRoles',
  component: AllRoles,
  decorators: [ComponentDecorator, I18nFrontDecorator, RouterDecorator],
  parameters: {
    maxWidth: 800,
  },
};

export default meta;
type Story = StoryObj<typeof AllRoles>;

export const Default: Story = {
  args: {
    roles: getRolesMock(),
  },
};
