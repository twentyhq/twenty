import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CatalogDecorator, type CatalogStory } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const WIDGET_ID = 'widget-card-header-story';

type WidgetCardHeaderStoryProps = {
  title: string;
  isInEditMode: boolean;
  count?: number;
};

const WidgetCardHeaderStory = ({
  title,
  isInEditMode,
  count,
}: WidgetCardHeaderStoryProps) => (
  <PageLayoutTestWrapper instanceId={PAGE_LAYOUT_TEST_INSTANCE_ID}>
    <WidgetComponentInstanceContext.Provider value={{ instanceId: WIDGET_ID }}>
      <WidgetHeaderCountEffect count={count} />
      <WidgetCardHeader
        widgetId={WIDGET_ID}
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
                return { count: undefined };
              case 'edit mode':
                return { count: 5, isInEditMode: true };
              default:
                return { count: 42 };
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
