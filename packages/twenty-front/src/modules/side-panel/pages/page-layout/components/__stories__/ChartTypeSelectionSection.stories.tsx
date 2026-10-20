import { ChartTypeSelectionSection } from '@/side-panel/pages/page-layout/components/ChartTypeSelectionSection';
import { GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof ChartTypeSelectionSection> = {
  title: 'Modules/SidePanel/PageLayout/ChartTypeSelectionSection',
  component: ChartTypeSelectionSection,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 320 } },
  args: {
    currentGraphType: GraphType.VERTICAL_BAR,
    setCurrentGraphType: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ChartTypeSelectionSection>;

export const KeyboardActivation: Story = {
  render: (args) => {
    const [currentGraphType, setCurrentGraphType] = useState(
      args.currentGraphType,
    );

    return (
      <ChartTypeSelectionSection
        currentGraphType={currentGraphType}
        setCurrentGraphType={(graphType) => {
          setCurrentGraphType(graphType);
          args.setCurrentGraphType(graphType);
        }}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = within(canvas.getByRole('group', { name: 'Chart type' }));
    const verticalBar = group.getByRole('button', {
      name: 'Vertical Bar Chart',
    });
    const line = group.getByRole('button', { name: 'Line Chart' });

    expect(verticalBar).toHaveAttribute('aria-pressed', 'true');
    expect(line).toHaveAttribute('aria-pressed', 'false');
    expect(group.getAllByRole('button')).toHaveLength(5);
    expect(line.getBoundingClientRect().height).toBe(32);
    expect(line.getBoundingClientRect().width).toBeCloseTo(
      verticalBar.getBoundingClientRect().width,
    );

    line.focus();
    await userEvent.keyboard('{Enter}');
    expect(args.setCurrentGraphType).toHaveBeenCalledTimes(1);
    expect(args.setCurrentGraphType).toHaveBeenCalledWith(GraphType.LINE);
    await waitFor(() => {
      expect(line).toHaveAttribute('aria-pressed', 'true');
      expect(verticalBar).toHaveAttribute('aria-pressed', 'false');
    });
    await userEvent.keyboard(' ');
    expect(args.setCurrentGraphType).toHaveBeenCalledTimes(2);
    await userEvent.click(verticalBar);
    expect(args.setCurrentGraphType).toHaveBeenCalledTimes(3);
    expect(args.setCurrentGraphType).toHaveBeenLastCalledWith(
      GraphType.VERTICAL_BAR,
    );
  },
};
