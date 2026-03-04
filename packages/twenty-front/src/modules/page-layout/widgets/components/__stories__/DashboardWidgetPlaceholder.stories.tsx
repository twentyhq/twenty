import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isAppMetadataReadyState } from '@/metadata-store/states/isAppMetadataReadyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { DashboardWidgetPlaceholder } from '@/page-layout/widgets/components/DashboardWidgetPlaceholder';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';
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
      jotaiStore.set(
        objectMetadataItemsState.atom,
        generatedMockObjectMetadataItems,
      );
      jotaiStore.set(isAppMetadataReadyState.atom, true);
      jotaiStore.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        mockPageLayout,
      );

      return (
        <PageLayoutTestWrapper store={jotaiStore}>
          <LayoutRenderingProvider
            value={{
              isInRightDrawer: false,
              layoutType: PageLayoutType.DASHBOARD,
              targetRecordIdentifier: undefined,
            }}
          >
            <PageLayoutContentProvider
              value={{
                tabId: 'tab-1',
                layoutMode: PageLayoutTabLayoutMode.GRID,
              }}
            >
              <Story />
            </PageLayoutContentProvider>
          </LayoutRenderingProvider>
        </PageLayoutTestWrapper>
      );
    },
    ComponentDecorator,
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
