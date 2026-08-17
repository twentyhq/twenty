import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CatalogDecorator, type CatalogStory } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const WIDGET_ID = 'widget-card-header-story';

type WidgetCardHeaderStoryProps = {
  title: string;
  isInEditMode: boolean;
  count?: number;
  widgetId?: string;
};

const WidgetCardHeaderStory = ({
  title,
  isInEditMode,
  count,
  widgetId = WIDGET_ID,
}: WidgetCardHeaderStoryProps) => (
  <PageLayoutTestWrapper instanceId={PAGE_LAYOUT_TEST_INSTANCE_ID}>
    <WidgetComponentInstanceContext.Provider value={{ instanceId: widgetId }}>
      <WidgetHeaderCountEffect count={count} />
      <WidgetCardHeader
        widgetId={widgetId}
        variant="dashboard"
        isInEditMode={isInEditMode}
        title={title}
      />
    </WidgetComponentInstanceContext.Provider>
  </PageLayoutTestWrapper>
);

const meta: Meta<typeof WidgetCardHeaderStory> = {
  title: 'Modules/PageLayout/Widgets/WidgetCardHeader',
  component: WidgetCardHeaderStory,
  decorators: [MemoryRouterDecorator],
  args: {
    title: 'Call recordings',
    isInEditMode: false,
  },
};

export default meta;
type Story = StoryObj<typeof WidgetCardHeaderStory>;

export const Catalog: CatalogStory<Story, typeof WidgetCardHeaderStory> = {
  decorators: [CatalogDecorator],
  args: {
    count: 42,
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'header state',
          values: ['count', 'no count', 'edit mode'],
          props: (headerStateVariant: string) => {
            switch (headerStateVariant) {
              case 'no count':
                return { count: undefined, widgetId: `${WIDGET_ID}-no-count` };
              case 'edit mode':
                return {
                  count: 5,
                  isInEditMode: true,
                  widgetId: `${WIDGET_ID}-edit-mode`,
                };
              default:
                return { count: 42, widgetId: `${WIDGET_ID}-count` };
            }
          },
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('42')).toBeVisible();
    expect(await canvas.findByText('5')).toBeVisible();
  },
};

const UnmountingContentStory = () => {
  const [isContentMounted, setIsContentMounted] = useState(true);

  return (
    <PageLayoutTestWrapper instanceId={PAGE_LAYOUT_TEST_INSTANCE_ID}>
      <WidgetComponentInstanceContext.Provider
        value={{ instanceId: `${WIDGET_ID}-unmount` }}
      >
        {isContentMounted && <WidgetHeaderCountEffect count={42} />}
        <WidgetCardHeader
          widgetId={`${WIDGET_ID}-unmount`}
          variant="dashboard"
          isInEditMode={false}
          title="Call recordings"
        />
        <button onClick={() => setIsContentMounted(false)}>
          Unmount content
        </button>
      </WidgetComponentInstanceContext.Provider>
    </PageLayoutTestWrapper>
  );
};

export const CountClearsWhenContentUnmounts: Story = {
  render: () => <UnmountingContentStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('42')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Unmount content' }),
    );

    await waitFor(() => {
      expect(canvas.queryByText('42')).toBeNull();
    });
  },
};

export const CountEffectNoOpsOutsideWidget: Story = {
  render: () => (
    <>
      <WidgetHeaderCountEffect count={7} />
      <div>Rendered without a widget</div>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Rendered without a widget')).toBeVisible();
  },
};
