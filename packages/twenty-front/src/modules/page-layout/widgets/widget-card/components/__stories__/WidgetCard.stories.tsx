import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type CSSProperties } from 'react';
import { expect, within } from 'storybook/test';

import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof WidgetCard> = {
  title: 'Modules/PageLayout/Widgets/WidgetCard',
  component: WidgetCard,
  decorators: [ComponentDecorator],
  args: {
    variant: 'framed',
    isEditable: false,
    isEditing: false,
    isDragging: false,
    isResizing: false,
    'data-testid': 'widget-card',
  },
  render: (args) => (
    <div style={{ height: 160, width: 320 }}>
      {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
      <WidgetCard {...args}>Widget content</WidgetCard>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof WidgetCard>;

const SURFACE_COLOR = 'rgb(1, 2, 3)';

export const Framed: Story = {
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByTestId('widget-card');
    const cardStyle = getComputedStyle(card);

    await expect(
      cardStyle.getPropertyValue('--record-card-background-color').trim(),
    ).toBe(cardStyle.getPropertyValue('--t-background-secondary').trim());
    await expect(cardStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  },
};

export const Flush: Story = {
  args: {
    variant: 'flush',
  },
  render: (args) => (
    <div
      style={
        {
          height: 160,
          width: 320,
          '--record-card-background-color': SURFACE_COLOR,
        } as CSSProperties
      }
    >
      {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
      <WidgetCard {...args}>Widget content</WidgetCard>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByTestId('widget-card');
    const cardStyle = getComputedStyle(card);

    await expect(
      cardStyle.getPropertyValue('--record-card-background-color').trim(),
    ).toBe(SURFACE_COLOR);
    await expect(cardStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  },
};

export const FlushWhileDragging: Story = {
  args: {
    variant: 'flush',
    isEditable: true,
    isDragging: true,
  },
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByTestId('widget-card');
    const cardStyle = getComputedStyle(card);

    await expect(
      cardStyle.getPropertyValue('--record-card-background-color').trim(),
    ).toBe(cardStyle.getPropertyValue('--t-background-secondary').trim());
    await expect(cardStyle.backgroundImage).toContain('linear-gradient');
    await expect(cardStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  },
};
