import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsBillingLimitSpenderSelect } from '@/settings/billing/components/SettingsBillingLimitSpenderSelect';

const meta: Meta<typeof SettingsBillingLimitSpenderSelect> = {
  title: 'Modules/Settings/Billing/SettingsBillingLimitSpenderSelect',
  component: SettingsBillingLimitSpenderSelect,
  decorators: [ComponentDecorator],
  args: {
    allowedSpenderTypes: [
      'workspace',
      'userWorkspace',
      'apiKey',
      'application',
      'agent',
    ],
    isIntraWorkspaceLimitEntitled: true,
    spenderType: 'workspace',
    spenderId: '',
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof SettingsBillingLimitSpenderSelect>;

export const WorkspaceWide: Story = {};

export const AllUsers: Story = {
  args: { spenderType: 'userWorkspace', spenderId: '' },
};

export const WorkspaceOnlyPlan: Story = {
  args: { isIntraWorkspaceLimitEntitled: false },
};

export const ReadOnly: Story = {
  args: { isDisabled: true },
};
