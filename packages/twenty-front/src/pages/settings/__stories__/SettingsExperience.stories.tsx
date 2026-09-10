import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { within } from 'storybook/test';
import { SettingsExperience } from '~/pages/settings/profile/appearance/components/SettingsExperience';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsExperience',
  component: SettingsExperience,
  decorators: [PageDecorator],
  args: { routePath: '/settings/experience' },
  parameters: {
    msw: graphqlMocks,
    date: new Date(2021, 1, 1),
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsExperience>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findAllByText('Experience', undefined, {
      timeout: 3000,
    });

    await canvas.findByText('Formats');
  },
};
