import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { userEvent, within } from '@storybook/test';
import { SettingsAppearance } from '../profile/appearance/components/SettingsAppearance';

Date.now = () => new Date('2022-06-13T12:33:37.000Z').getTime();

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsAppearance',
  component: SettingsAppearance,
  decorators: [PageDecorator],
  args: { routePath: '/settings/appearance' },
  parameters: {
    msw: graphqlMocks,
    date: new Date(2021, 1, 1),
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAppearance>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Theme', undefined, {
      timeout: 3000,
    });

    await canvas.findByText('Date and time');
  },
};

export const DateTimeSettingsTimezone: Story = {
  play: async () => {
    const canvas = within(document.body);

    await canvas.findByText('Date and time');

    const timezoneSelect = await canvas.findByText(
      '(GMT-04:00) Eastern Daylight Time - New York',
    );

    userEvent.click(timezoneSelect);

    const systemSettingsOptions = await canvas.findByText(
      '(GMT-11:00) Niue Time',
    );

    userEvent.click(systemSettingsOptions);

    await canvas.findByText('(GMT-11:00) Niue Time');
  },
};

export const DateTimeSettingsDateFormat: Story = {
  play: async () => {
    const canvas = within(document.body);

    await canvas.findByText('Date and time');

    const timeFormatSelect = await canvas.findByText('13 Jun, 2022');

    userEvent.click(timeFormatSelect);

    const timeFormatOptions = await canvas.findByText('Jun 13, 2022');

    userEvent.click(timeFormatOptions);

    await canvas.findByText('Jun 13, 2022');
  },
};

export const DateTimeSettingsTimeFormat: Story = {
  play: async () => {
    const canvas = within(document.body);

    await canvas.findByText('Date and time');

    const timeFormatSelect = await canvas.findByText('24h (08:33)');

    userEvent.click(timeFormatSelect);

    const timeFormatOptions = await canvas.findByText('12h (8:33 AM)');

    userEvent.click(timeFormatOptions);

    await canvas.findByText('12h (8:33 AM)');
  },
};
