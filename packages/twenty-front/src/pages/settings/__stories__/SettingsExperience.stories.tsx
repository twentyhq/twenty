import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { userEvent, within } from '@storybook/test';
import { SettingsExperience } from '../profile/appearance/components/SettingsExperience';

Date.now = () => new Date('2022-06-13T12:33:37.000Z').getTime();

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

    const timeFormatSelect = await canvas.findByText('24h (08:33)');

    userEvent.click(timeFormatSelect);

    const timeFormatOptions = await canvas.findByText('12h (8:33 AM)');

    userEvent.click(timeFormatOptions);

    await canvas.findByText('12h (8:33 AM)');
  },
};

export const DateTimeSettingsTimezone: Story = {
  play: async () => {
    const canvas = within(document.body);

    await canvas.findByText('Date and time');

    const timezoneSelect = await canvas.findByText(
      '(GMT-05:00) Eastern Standard Time - New York',
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
