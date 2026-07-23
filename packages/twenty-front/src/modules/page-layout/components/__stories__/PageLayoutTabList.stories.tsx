import { styled } from '@linaria/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { ComponentWithRouterDecorator } from 'twenty-ui/testing';

import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { PageLayoutWidgetDndProvider } from '@/page-layout/components/dnd/PageLayoutWidgetDndProvider';
import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { PageLayoutType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  border: 1px solid ${themeCssVariables.border.color.strong};
  padding: ${themeCssVariables.spacing[4]};
  width: 720px;
`;

const createInitialTabs = (): PageLayoutTab[] => [
  {
    __typename: 'PageLayoutTab',
    isActive: true,
    applicationId: '',
    id: 'overview',
    title: 'Overview',
    position: 0,
    icon: 'IconPlus',
    pageLayoutId: 'test-layout',
    widgets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    __typename: 'PageLayoutTab',
    isActive: true,
    applicationId: '',
    id: 'revenue',
    title: 'Revenue',
    position: 1,
    pageLayoutId: 'test-layout',
    widgets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    __typename: 'PageLayoutTab',
    isActive: true,
    applicationId: '',
    id: 'forecasts',
    title: 'Forecasts',
    position: 2,
    pageLayoutId: 'test-layout',
    widgets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
];

const PageLayoutTabListPlayground = ({
  isReorderEnabled,
}: {
  isReorderEnabled: boolean;
}) => {
  const [tabs, setTabs] = useState<PageLayoutTab[]>(createInitialTabs());
  const [nextIndex, setNextIndex] = useState(tabs.length);

  const sortedTabs = useMemo(() => {
    return [...tabs].sort((a, b) => a.position - b.position);
  }, [tabs]);

  const handleAddTab = () => {
    setTabs((prev) => [
      ...prev,
      {
        __typename: 'PageLayoutTab',
        isActive: true,
        applicationId: '',
        id: `new-tab-${nextIndex}`,
        title: `New Tab ${nextIndex}`,
        position: nextIndex,
        pageLayoutId: 'test-layout',
        widgets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ]);
    setNextIndex((value) => value + 1);
  };

  return (
    <StyledContainer>
      <PageLayoutTabListEffect
        tabs={sortedTabs}
        componentInstanceId="page-layout-tab-list-story"
      />

      <PageLayoutWidgetDndProvider>
        <PageLayoutTabList
          tabs={sortedTabs}
          componentInstanceId="page-layout-tab-list-story"
          behaveAsLinks={false}
          loading={false}
          addTabStrategy={
            isReorderEnabled
              ? { mode: 'direct', onCreate: handleAddTab }
              : undefined
          }
          isReorderEnabled={isReorderEnabled}
          pageLayoutType={PageLayoutType.DASHBOARD}
        />
      </PageLayoutWidgetDndProvider>
    </StyledContainer>
  );
};

const meta: Meta<typeof PageLayoutTabListPlayground> = {
  title: 'Modules/PageLayout/PageLayoutTabList',
  component: PageLayoutTabListPlayground,
  args: {
    isReorderEnabled: true,
  },
  decorators: [
    ComponentWithRouterDecorator,
    (Story) => (
      <PageLayoutEditModeProviderContext value={{ isInEditMode: false }}>
        <PageLayoutComponentInstanceContext.Provider
          value={{ instanceId: 'instance-id' }}
        >
          <Story />
        </PageLayoutComponentInstanceContext.Provider>
      </PageLayoutEditModeProviderContext>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PageLayoutTabListPlayground>;

export const Default: Story = {
  args: {
    isReorderEnabled: true,
  },
};
