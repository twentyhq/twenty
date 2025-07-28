import { SettingsPath } from '@/types/SettingsPath';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { SettingsDevelopersApiKeysNew } from '~/pages/settings/developers/api-keys/SettingsDevelopersApiKeysNew';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/ApiKeys/SettingsDevelopersApiKeysNew',
  component: SettingsDevelopersApiKeysNew,
  decorators: [PageDecorator],
  args: { routePath: getSettingsPath(SettingsPath.NewApiKey) },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersApiKeysNew>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('New key');
    await canvas.findByText('Name');
    await canvas.findByText('Role');
    await canvas.findByText('Expiration Date');

    const nameInput = await canvas.findByPlaceholderText(
      'E.g. backoffice integration',
    );

    await userEvent.type(nameInput, 'Test');

    const roleSelector = await canvas.findByText('Admin');
    await userEvent.click(roleSelector);

    const adminOption = await canvas.findByText('Admin');
    await userEvent.click(adminOption);

    const saveButton = await canvas.findByText('Save');

    await userEvent.click(saveButton);
  },
};
