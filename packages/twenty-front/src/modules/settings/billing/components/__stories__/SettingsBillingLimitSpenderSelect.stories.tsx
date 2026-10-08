import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { SettingsBillingLimitSpenderSelect } from '@/settings/billing/components/SettingsBillingLimitSpenderSelect';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApiKeys } from '~/testing/mock-data/generated/metadata/api-keys/mock-api-keys-data';

const meta: Meta<typeof SettingsBillingLimitSpenderSelect> = {
  title: 'Modules/Settings/Billing/SettingsBillingLimitSpenderSelect',
  component: SettingsBillingLimitSpenderSelect,
  decorators: [ComponentWithRouterDecorator],
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
  args: { isIntraWorkspaceLimitEntitled: false, onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(within(canvasElement).getByRole('button'));
    const popup = await body.findByRole('dialog', { name: 'Spender' });

    expect(within(popup).getAllByLabelText('Organization')).toHaveLength(3);
    await userEvent.click(within(popup).getByText('User'));
    expect(
      within(popup).queryByRole('button', { name: 'All users' }),
    ).not.toBeInTheDocument();
    expect(args.onChange).not.toHaveBeenCalled();
    expect(
      within(popup).getByRole('link', { name: 'Upgrade to Organization' }),
    ).toHaveAttribute('href', '/settings/billing/plans');
    await userEvent.keyboard('{Escape}');
  },
};

export const ReadOnly: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
  },
};

export const SpenderPagesAndSelection: Story = {
  args: { onChange: fn() },
  parameters: { msw: graphqlMocks },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button');

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Spender' });

    expect(
      within(popup).getByRole('button', { name: /Workspace/, pressed: true }),
    ).toBeVisible();

    await userEvent.click(within(popup).getByRole('button', { name: 'User' }));
    expect(
      await within(popup).findByRole('button', { name: 'All users' }),
    ).toBeVisible();
    await userEvent.click(within(popup).getByRole('button', { name: 'User' }));
    await waitFor(() =>
      expect(within(popup).getByRole('button', { name: 'User' })).toHaveFocus(),
    );
    expect(
      within(popup).queryByRole('button', { name: 'All users' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      within(popup).getByRole('button', { name: 'API key' }),
    );
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'My api key' }),
    );
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(args.onChange).toHaveBeenCalledWith({
      spenderType: 'apiKey',
      spenderId: mockedApiKeys[0].id,
    });

    await userEvent.click(trigger);
    expect(
      await body.findByRole('button', { name: 'Application' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};
