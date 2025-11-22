import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { DashboardWidgetPlaceholder } from '@/page-layout/widgets/components/DashboardWidgetPlaceholder';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { type Meta, type StoryObj } from '@storybook/react';
import { type MutableSnapshot } from 'recoil';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType } from '~/generated/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const mockPageLayout: PageLayout = {
  id: 'page-layout-1',
  name: 'Test Layout',
  type: PageLayoutType.DASHBOARD,
  objectMetadataId: null,
  tabs: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const meta: Meta<typeof DashboardWidgetPlaceholder> = {
  title: 'Modules/PageLayout/Widgets/DashboardWidgetPlaceholder',
  component: DashboardWidgetPlaceholder,
  decorators: [
    (Story) => {
      const initializeState = (snapshot: MutableSnapshot) => {
        snapshot.set(
          objectMetadataItemsState,
          generatedMockObjectMetadataItems,
        );
        snapshot.set(shouldAppBeLoadingState, false);
        snapshot.set(
          pageLayoutPersistedComponentState.atomFamily({
            instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          }),
          mockPageLayout,
        );
      };

      return (
        <PageLayoutTestWrapper initializeState={initializeState}>
          <LayoutRenderingProvider
            value={{
              isInRightDrawer: false,
              layoutType: PageLayoutType.DASHBOARD,
              targetRecordIdentifier: undefined,
            }}
          >
            <PageLayoutContentProvider
              value={{ tabId: 'tab-1', layoutMode: 'grid' }}
            >
              <Story />
            </PageLayoutContentProvider>
          </LayoutRenderingProvider>
        </PageLayoutTestWrapper>
      );
    },
    ComponentDecorator,
    I18nFrontDecorator,
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A self-contained placeholder widget that appears when no widgets are present. Automatically enables edit mode when clicked and opens the widget type selection command menu.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DashboardWidgetPlaceholder>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default widget placeholder state. Click to trigger the add widget flow.',
      },
    },
  },
};
