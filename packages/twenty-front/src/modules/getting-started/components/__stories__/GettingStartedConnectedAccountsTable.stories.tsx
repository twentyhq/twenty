import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme';

import { GettingStartedConnectedAccountsTable } from '@/getting-started/components/GettingStartedConnectedAccountsTable';
import { mockedDropdownConnectedAccount } from '@/settings/accounts/components/__stories__/mockedDropdownConnectedAccount';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const StyledFrame = styled.div`
  padding: ${themeCssVariables.spacing[6]};
  width: 660px;
`;

const meta: Meta<typeof GettingStartedConnectedAccountsTable> = {
  title: 'Modules/GettingStarted/GettingStartedConnectedAccountsTable',
  component: GettingStartedConnectedAccountsTable,
  decorators: [
    (Story) => (
      <StyledFrame>
        <Story />
      </StyledFrame>
    ),
    ComponentWithRouterDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof GettingStartedConnectedAccountsTable>;

export const Default: Story = {
  args: {
    accounts: [
      {
        ...mockedDropdownConnectedAccount,
        provider: ConnectedAccountProvider.GOOGLE,
        handle: 'bertrand@acme.com',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', {
        name: 'Open bertrand@acme.com settings',
      }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'More options' }),
    ).not.toBeInTheDocument();
  },
};
