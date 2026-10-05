import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type CSSProperties } from 'react';
import { expect, within } from 'storybook/test';

import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardContent } from '@/page-layout/widgets/widget-card/components/WidgetCardContent';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

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

export const EmptyFlush: Story = {
  args: {
    variant: 'flush',
  },
  decorators: [MemoryRouterDecorator],
  render: (args) => (
    <PageLayoutTestWrapper>
      <div style={{ width: 320, '--widget-height': 'auto' } as CSSProperties}>
        {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
        <WidgetCard {...args}>
          <WidgetCardHeader
            widgetId="empty-widget-card"
            variant={args.variant}
            isInEditMode={args.isEditable}
            title="Calendar Event"
          />
          <WidgetCardContent
            variant={args.variant}
            hasHeader
            isEditable={args.isEditable}
          />
        </WidgetCard>
      </div>
    </PageLayoutTestWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('widget-card');
    const title = canvas.getByText('Calendar Event');

    await expect(title).toBeVisible();

    const cardBounds = card.getBoundingClientRect();
    const titleBounds = title.getBoundingClientRect();
    const topInset = titleBounds.top - cardBounds.top;
    const bottomInset = cardBounds.bottom - titleBounds.bottom;

    await expect(bottomInset).toBeGreaterThan(0);
    await expect(bottomInset).toBeCloseTo(topInset, 1);
  },
};

export const EmptyFlushInEditMode: Story = {
  ...EmptyFlush,
  args: {
    variant: 'flush',
    isEditable: true,
    isEditing: true,
  },
};
