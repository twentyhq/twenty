import { type Meta, type StoryObj } from '@storybook/react';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { userEvent, within } from '@storybook/test';
import { getCanvasElementForDropdownTesting } from 'twenty-ui/testing';
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
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    await canvas.findAllByText('Experience', undefined, {
      timeout: 3000,
    });

    await canvas.findByText('Formats');
  },
};

export const DateTimeSettingsTimeFormat: Story = {
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    await canvas.findByText('Formats', undefined, { timeout: 5000 });

    const timeFormatSelect = await canvas.findByText('24h (05:30)', undefined, {
      timeout: 3000,
    });

    await userEvent.click(timeFormatSelect);

    const timeFormatOptions = await canvas.findByText('12h (5:30 AM)', undefined, {
      timeout: 3000,
    });

    await userEvent.click(timeFormatOptions);

    await canvas.findByText('12h (5:30 AM)', undefined, { timeout: 3000 });
  },
};

export const DateTimeSettingsTimezone: Story = {
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    await canvas.findByText('Formats', undefined, { timeout: 5000 });

    const timezoneSelect = await canvas.findByText(
      '(GMT-04:00) Eastern Daylight Time - New York',
      undefined,
      { timeout: 3000 },
    );

    await userEvent.click(timezoneSelect);

    const systemSettingsOptions = await canvas.findByText(
      '(GMT-11:00) Niue Time',
      undefined,
      { timeout: 3000 },
    );

    await userEvent.click(systemSettingsOptions);

    await canvas.findByText('(GMT-11:00) Niue Time', undefined, {
      timeout: 3000,
    });
  },
};

export const DateTimeSettingsDateFormat: Story = {
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    await canvas.findByText('Formats', undefined, { timeout: 5000 });

    const timeFormatSelect = await canvas.findByText('12 Mar, 2024', undefined, {
      timeout: 3000,
    });

    await userEvent.click(timeFormatSelect);

    const timeFormatOptions = await canvas.findByText('Mar 12, 2024', undefined, {
      timeout: 3000,
    });

    await userEvent.click(timeFormatOptions);

    await canvas.findByText('Mar 12, 2024', undefined, { timeout: 3000 });
  },
};
