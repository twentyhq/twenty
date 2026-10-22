import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SettingsObjectNewFieldSelect } from '~/pages/settings/data-model/new-field/SettingsObjectNewFieldSelect';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title:
    'Pages/Settings/DataModel/SettingsObjectNewField/SettingsObjectNewFieldSelect',
  component: SettingsObjectNewFieldSelect,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:objectNamePlural/new-field/select',
    routeParams: { ':objectNamePlural': 'companies' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectNewFieldSelect>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Objects');
    await canvas.findByText('1. Select a field type');
    const searchInput = await canvas.findByPlaceholderText('Search a type');
    await userEvent.type(searchInput, 'Rela');
    await expect(
      await canvas.findByRole('link', { name: 'Relation' }),
    ).toBeVisible();
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'Num');
    await expect(
      await canvas.findByRole('link', { name: 'Number' }),
    ).toBeVisible();
  },
};
