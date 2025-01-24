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
  title: 'Pages/Settings/Developers/ApiKeys/SettingsDevelopersApiKeysNew',
  component: SettingsDevelopersApiKeysNew,
  decorators: [PageDecorator],
  args: { routePath: getSettingsPath(SettingsPath.DevelopersNewApiKey) },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersApiKeysNew>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('New Key');
    await canvas.findByText('Name');
    await canvas.findByText('Expiration Date');

    const input = await canvas.findByPlaceholderText(
      'E.g. backoffice integration',
    );

    await userEvent.type(input, 'Test');

    const saveButton = await canvas.findByText('Save');

    await userEvent.click(saveButton);
  },
};
