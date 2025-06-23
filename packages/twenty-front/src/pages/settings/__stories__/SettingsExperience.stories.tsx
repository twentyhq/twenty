import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { userEvent, within } from '@storybook/test';
import { SettingsExperience } from '../profile/appearance/components/SettingsExperience';

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

    await canvas.findByText('Date and time');
  },
};

export const DateTimeSettingsTimeFormat: Story = {
  play: async () => {
    const canvas = within(document.body);

    await canvas.findByText('Date and time');

    const timeFormatSelect = await canvas.findByText('24h (05:30)');

    await userEvent.click(timeFormatSelect);

    const timeFormatOptions = await canvas.findByText('12h (5:30 AM)');

    await userEvent.click(timeFormatOptions);

    await canvas.findByText('12h (5:30 AM)');
  },
};

export const DateTimeSettingsTimezone: Story = {
  play: async () => {
    const canvas = within(document.body);

    await canvas.findByText('Date and time');

    const timezoneSelect = await canvas.findByText(
      '(GMT-04:00) Eastern Daylight Time - New York',
    );

    await userEvent.click(timezoneSelect);

    const systemSettingsOptions = await canvas.findByText(
      '(GMT-11:00) Niue Time',
    );

    await userEvent.click(systemSettingsOptions);

    await canvas.findByText('(GMT-11:00) Niue Time');
  },
};

export const DateTimeSettingsDateFormat: Story = {
  play: async () => {
    const canvas = within(document.body);

    await canvas.findByText('Date and time');

    const timeFormatSelect = await canvas.findByText('12 Mar, 2024');

    await userEvent.click(timeFormatSelect);

    const timeFormatOptions = await canvas.findByText('Mar 12, 2024');

    await userEvent.click(timeFormatOptions);

    await canvas.findByText('Mar 12, 2024');
  },
};
