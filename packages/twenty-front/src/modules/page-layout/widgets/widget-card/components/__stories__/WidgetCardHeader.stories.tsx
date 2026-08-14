import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { WidgetHeaderInfoEffect } from '@/page-layout/widgets/components/WidgetHeaderInfoEffect';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { type WidgetHeaderInfo } from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { IconArrowUpRight, IconCopy, IconPlus } from 'twenty-ui/icon';
import { CatalogDecorator, type CatalogStory } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const WIDGET_ID = 'widget-card-header-story';

type WidgetCardHeaderStoryProps = {
  title: string;
  isInEditMode: boolean;
  headerInfo: WidgetHeaderInfo;
};

const WidgetCardHeaderStory = ({
  title,
  isInEditMode,
  headerInfo,
}: WidgetCardHeaderStoryProps) => (
  <PageLayoutTestWrapper instanceId={PAGE_LAYOUT_TEST_INSTANCE_ID}>
    <WidgetComponentInstanceContext.Provider value={{ instanceId: WIDGET_ID }}>
      <WidgetHeaderInfoEffect {...headerInfo} />
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
    headerInfo: { count: 42 },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'header info',
          values: [
            'count only',
            'single button',
            'single link',
            'button and link',
            'disabled button',
            'edit mode',
          ],
          props: (headerInfoVariant: string) => {
            switch (headerInfoVariant) {
              case 'single button':
                return {
                  headerInfo: {
                    count: 8,
                    actions: [
                      {
                        id: 'copy-transcript',
                        Icon: IconCopy,
                        label: 'Copy transcript',
                        onClick: fn(),
                      },
                    ],
                  },
                };
              case 'single link':
                return {
                  headerInfo: {
                    count: 3,
                    actions: [
                      {
                        id: 'see-all',
                        Icon: IconArrowUpRight,
                        label: 'See all',
                        to: '/objects/callRecordings',
                      },
                    ],
                  },
                };
              case 'button and link':
                return {
                  headerInfo: {
                    count: 128,
                    actions: [
                      {
                        id: 'compose',
                        Icon: IconPlus,
                        label: 'Compose',
                        onClick: fn(),
                      },
                      {
                        id: 'open-timeline',
                        Icon: IconArrowUpRight,
                        label: 'Open timeline',
                        to: '/objects/tasks',
                      },
                    ],
                  },
                };
              case 'disabled button':
                return {
                  headerInfo: {
                    actions: [
                      {
                        id: 'new-note',
                        Icon: IconPlus,
                        label: 'New note',
                        onClick: fn(),
                        disabled: true,
                      },
                    ],
                  },
                };
              case 'edit mode':
                return {
                  isInEditMode: true,
                  headerInfo: {
                    count: 5,
                    actions: [
                      {
                        id: 'hidden-in-edit-mode',
                        Icon: IconPlus,
                        label: 'Hidden in edit mode',
                        onClick: fn(),
                      },
                    ],
                  },
                };
              default:
                return { headerInfo: { count: 42 } };
            }
          },
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('button', { name: 'Copy transcript' });

    const seeAllLink = await canvas.findByRole('link', { name: 'See all' });
    expect(seeAllLink).toHaveAttribute('href', '/objects/callRecordings');

    await canvas.findByRole('button', { name: 'Compose' });
    const openTimelineLink = await canvas.findByRole('link', {
      name: 'Open timeline',
    });
    expect(openTimelineLink).toHaveAttribute('href', '/objects/tasks');

    const disabledButton = await canvas.findByRole('button', {
      name: 'New note',
    });
    expect(disabledButton).toBeDisabled();

    expect(
      canvas.queryByRole('button', { name: 'Hidden in edit mode' }),
    ).toBeNull();
  },
};
