import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SettingsObjectIndexes } from '~/pages/settings/data-model/SettingsObjectIndexes';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/DataModel/SettingsObjectIndexes',
  component: SettingsObjectIndexes,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:objectNamePlural/object-indexes',
    routeParams: { ':objectNamePlural': 'companies' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectIndexes>;

export const HideSystemIndexes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const filterButton = await canvas.findByRole('button', { name: 'Filter' });

    expect(await canvas.findByText('Account Owner')).toBeVisible();
    await userEvent.click(filterButton);
    const filterPanel = await body.findByRole('dialog', { name: 'Filter' });
    const hideSystemIndexes = within(filterPanel).getByRole('switch', {
      name: 'Hide system indexes',
    });

    await userEvent.click(hideSystemIndexes);
    expect(hideSystemIndexes).toBeChecked();
    expect(filterPanel).toBeVisible();
    await waitFor(() =>
      expect(canvas.queryByText('Account Owner')).not.toBeInTheDocument(),
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(filterPanel).not.toBeInTheDocument());
    await waitFor(() => expect(filterButton).toHaveFocus());
  },
};
