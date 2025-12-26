import styled from '@emotion/styled';
import { type DropResult, type ResponderProvided } from '@hello-pangea/dnd';
import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import { RecoilRoot } from 'recoil';
import { ComponentWithRouterDecorator } from 'twenty-ui/testing';

import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';

const StyledContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  padding: ${({ theme }) => theme.spacing(4)};
  width: 720px;
`;

const createInitialTabs = (): PageLayoutTab[] => [
  {
    __typename: 'PageLayoutTab',
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

  const handleReorder = (
    result: DropResult,
    _provided: ResponderProvided,
  ): boolean => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return false;
    }

    const isDroppedOnMoreButton =
      destination.droppableId ===
      PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.MORE_BUTTON;

    if (isDroppedOnMoreButton) {
      setTabs((prev) => {
        const maxPosition = Math.max(...prev.map((tab) => tab.position), 0);
        return prev.map((tab) =>
          tab.id === draggableId ? { ...tab, position: maxPosition + 1 } : tab,
        );
      });
      return true;
    }

    setTabs((prev) => {
      const sorted = [...prev].sort((a, b) => a.position - b.position);

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return prev;
      }

      const draggedTab = sorted.find((tab) => tab.id === draggableId);
      if (!draggedTab) {
        return prev;
      }

      const withoutDragged = sorted.filter((tab) => tab.id !== draggableId);

      const movingBetweenDroppables =
        destination.droppableId !== source.droppableId;

      const destinationIndexAdjusted =
        movingBetweenDroppables && destination.index > source.index
          ? destination.index - 1
          : destination.index;

      const newPosition = calculateNewPosition({
        destinationIndex: destinationIndexAdjusted,
        sourceIndex: source.index,
        items: withoutDragged,
      });

      return prev.map((tab) =>
        tab.id === draggableId ? { ...tab, position: newPosition } : tab,
      );
    });

    return false;
  };

  return (
    <StyledContainer>
      <PageLayoutTabListEffect
        tabs={sortedTabs}
        componentInstanceId="page-layout-tab-list-story"
      />

      <PageLayoutTabList
        tabs={sortedTabs}
        componentInstanceId="page-layout-tab-list-story"
        behaveAsLinks={false}
        loading={false}
        onAddTab={isReorderEnabled ? handleAddTab : undefined}
        isReorderEnabled={isReorderEnabled}
        onReorder={isReorderEnabled ? handleReorder : undefined}
      />
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
      <RecoilRoot>
        <PageLayoutComponentInstanceContext.Provider
          value={{ instanceId: 'instance-id' }}
        >
          <Story />
        </PageLayoutComponentInstanceContext.Provider>
      </RecoilRoot>
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
