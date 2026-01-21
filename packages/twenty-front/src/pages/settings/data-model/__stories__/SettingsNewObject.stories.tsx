import { type Meta, type StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsNewObject } from '~/pages/settings/data-model/SettingsNewObject';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/DataModel/SettingsNewObject',
  component: SettingsNewObject,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/new',
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsNewObject>;

export const WithStandardSelected: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole(
      'heading',
      { name: 'New Object', level: 3 },
      { timeout: 5000 },
    );

    const listingInput = await canvas.findByPlaceholderText('Listing');
    const pluralInput = await canvas.findByPlaceholderText('Listings');
    const descriptionInput = await canvas.findByPlaceholderText(
      'Write a description',
    );
    const saveButton = await canvas.findByText('Save');
    await userEvent.type(listingInput, 'Company');
    await userEvent.type(pluralInput, 'Companies');
    await userEvent.type(descriptionInput, 'Test Description');

    await userEvent.click(saveButton);
  },
};
