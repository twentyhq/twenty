import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { SettingsApplicationOverviewCard } from '@/settings/applications/components/SettingsApplicationOverviewCard';
import { IconShoppingBag, IconTrash, IconUpload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const meta: Meta<typeof SettingsApplicationOverviewCard> = {
  title: 'Modules/Settings/Applications/SettingsApplicationOverviewCard',
  component: SettingsApplicationOverviewCard,
  decorators: [RootDecorator, ComponentDecorator],
  args: {
    displayName: 'Stripe',
    description: 'The Stripe app lets you import customer data into your CRM.',
    actions: (
      <>
        <Button
          startIcon={<IconShoppingBag />}
          variant="outline"
          size="sm"
          onClick={fn()}
        >
          See
        </Button>
        <Button
          startIcon={<IconUpload />}
          variant="outline"
          color="accent"
          size="sm"
          onClick={fn()}
        >
          Upgrade
        </Button>
        <Button
          startIcon={<IconTrash />}
          variant="outline"
          color="danger"
          size="sm"
          onClick={fn()}
        >
          Uninstall
        </Button>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof SettingsApplicationOverviewCard>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Stripe')).toBeVisible();
    expect(await canvas.findByRole('button', { name: /^See\b/ })).toBeVisible();
    expect(
      await canvas.findByRole('button', { name: /^Uninstall\b/ }),
    ).toBeVisible();
  },
};

export const WithoutActions: Story = {
  args: { actions: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Stripe')).toBeVisible();
    expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};
