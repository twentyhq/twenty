import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconChartPie } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ChartTypeChoice } from '@/side-panel/pages/page-layout/components/ChartTypeChoice';

const meta: Meta<typeof ChartTypeChoice> = {
  title: 'UI/Navigation/Menu/MenuPicker',
  component: ChartTypeChoice,
  decorators: [ComponentDecorator],
  args: {
    icon: IconChartPie,
    label: 'Chart',
    selected: false,
    onClick: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof ChartTypeChoice>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
export const Disabled: Story = { args: { disabled: true } };
export const WithoutLabel: Story = {};
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <ChartTypeChoice
        icon={IconChartPie}
        label="Default"
        selected={false}
        onClick={() => {}}
      />
      <ChartTypeChoice
        icon={IconChartPie}
        label="Selected"
        selected
        onClick={() => {}}
      />
      <ChartTypeChoice
        icon={IconChartPie}
        label="Disabled"
        selected={false}
        disabled
        onClick={() => {}}
      />
    </div>
  ),
};
