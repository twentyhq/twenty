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
          Icon={IconShoppingBag}
          title="See"
          variant="secondary"
          size="small"
          onClick={fn()}
        />
        <Button
          Icon={IconUpload}
          title="Upgrade"
          variant="secondary"
          accent="blue"
          size="small"
          onClick={fn()}
        />
        <Button
          Icon={IconTrash}
          title="Uninstall"
          variant="secondary"
          accent="danger"
          size="small"
          onClick={fn()}
        />
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
