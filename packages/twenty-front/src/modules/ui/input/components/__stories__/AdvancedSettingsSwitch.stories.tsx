import { AdvancedSettingsSwitch } from '@/ui/input/components/AdvancedSettingsSwitch';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ThemeProvider } from 'twenty-ui/theme-constants';

type ControlledAdvancedSettingsSwitchProps = ComponentProps<
  typeof AdvancedSettingsSwitch
>;

const ControlledAdvancedSettingsSwitch = ({
  isAdvancedModeEnabled,
  setIsAdvancedModeEnabled,
  ...props
}: ControlledAdvancedSettingsSwitchProps) => {
  const [enabled, setEnabled] = useState(isAdvancedModeEnabled);

  return (
    <AdvancedSettingsSwitch
      {...props}
      isAdvancedModeEnabled={enabled}
      setIsAdvancedModeEnabled={(nextEnabled) => {
        setEnabled(nextEnabled);
        setIsAdvancedModeEnabled(nextEnabled);
      }}
    />
  );
};

const meta: Meta<typeof AdvancedSettingsSwitch> = {
  title: 'UI/Input/AdvancedSettingsSwitch',
  component: AdvancedSettingsSwitch,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 300 } },
  args: {
    isAdvancedModeEnabled: false,
    setIsAdvancedModeEnabled: fn(),
  },
  render: (args) => <ControlledAdvancedSettingsSwitch {...args} />,
};

export default meta;
type Story = StoryObj<typeof AdvancedSettingsSwitch>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Advanced' });
    await userEvent.click(canvas.getByText('Advanced'));
    await expect(control).toBeChecked();
    await expect(args.setIsAdvancedModeEnabled).toHaveBeenLastCalledWith(true);
    await userEvent.click(control);
    await expect(control).not.toBeChecked();
    await expect(args.setIsAdvancedModeEnabled).toHaveBeenLastCalledWith(false);
    await expect(args.setIsAdvancedModeEnabled).toHaveBeenCalledTimes(2);
  },
};

export const Dark: Story = {
  ...Default,
  decorators: [
    (Story) => (
      <ThemeProvider colorScheme="dark" applyToRoot={false}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
