import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { SettingsApplicationVariableLabelRow } from '~/pages/settings/applications/components/SettingsApplicationVariableLabelRow';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsApplicationVariableLabelRow> = {
  title: 'Pages/Settings/Applications/SettingsApplicationVariableLabelRow',
  component: SettingsApplicationVariableLabelRow,
  args: {
    variableKey: 'MY_VARIABLE_KEY',
    isDeprecated: false,
    description: '',
    tooltipId: 'variable-label-row-tooltip',
  },
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsApplicationVariableLabelRow>;

export const WithLabel: Story = {
  args: {
    label: 'My variable',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('My variable')).toBeVisible();
    expect(canvas.queryByText('MY_VARIABLE_KEY')).not.toBeInTheDocument();
  },
};

export const WithoutLabel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('MY_VARIABLE_KEY')).toBeVisible();
  },
};
