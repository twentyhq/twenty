import { styled } from '@linaria/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useEffect, useMemo } from 'react';
import { ComponentWithRouterDecorator } from 'twenty-ui/testing';

import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { PageLayoutWidgetDndProvider } from '@/page-layout/components/dnd/PageLayoutWidgetDndProvider';
import { PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT } from '@/page-layout/constants/PageLayoutRecordIdentifierBarHeight';
import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { PageLayoutType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div<{ containerWidth: number }>`
  border: 1px solid ${themeCssVariables.border.color.strong};
  padding: ${themeCssVariables.spacing[4]};
  width: ${({ containerWidth }) => containerWidth}px;
`;

const StyledTabListContainer = styled.div<{ isInIdentifierBar: boolean }>`
  box-shadow: ${({ isInIdentifierBar }) =>
    isInIdentifierBar
      ? `inset 0 -1px 0 ${themeCssVariables.border.color.light}`
      : 'none'};
  display: ${({ isInIdentifierBar }) => (isInIdentifierBar ? 'flex' : 'block')};
  height: ${({ isInIdentifierBar }) =>
    isInIdentifierBar
      ? `${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT}px`
      : 'auto'};
`;

const createInitialTabs = (): PageLayoutTab[] => [
  {
    isSystemSideEffect: false,
    universalIdentifier: 'universal-identifier-mock',
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
    isSystemSideEffect: false,
    universalIdentifier: 'universal-identifier-mock',
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
    isSystemSideEffect: false,
    universalIdentifier: 'universal-identifier-mock',
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

type PageLayoutTabListPlaygroundProps = Pick<
  ComponentProps<typeof PageLayoutTabList>,
  'isReorderEnabled' | 'presentation' | 'centerTabs'
> & {
  containerWidth?: number;
};

const PageLayoutTabListPlayground = ({
  isReorderEnabled,
  presentation = 'standalone',
  centerTabs = false,
  containerWidth = 720,
}: PageLayoutTabListPlaygroundProps) => {
  const isInIdentifierBar = presentation === 'identifier-bar';
  // Tab drops are routed into the page-layout draft by the dnd provider, so
  // the story renders from that draft to stay interactive.
  const [pageLayoutDraft, setPageLayoutDraft] = useAtomComponentState(
    pageLayoutDraftComponentState,
  );

  useEffect(() => {
    setPageLayoutDraft((prev) =>
      prev.tabs.length > 0 ? prev : { ...prev, tabs: createInitialTabs() },
    );
  }, [setPageLayoutDraft]);

  const sortedTabs = useMemo(() => {
    return [...pageLayoutDraft.tabs].sort((a, b) => a.position - b.position);
  }, [pageLayoutDraft.tabs]);

  const handleAddTab = () => {
    setPageLayoutDraft((prev) => {
      const nextIndex = prev.tabs.length;

      return {
        ...prev,
        tabs: [
          ...prev.tabs,
          {
            __typename: 'PageLayoutTab',
            isActive: true,
            applicationId: '',
            isSystemSideEffect: false,
            universalIdentifier: 'universal-identifier-mock',
            id: `new-tab-${nextIndex}`,
            title: `New Tab ${nextIndex}`,
            position: nextIndex,
            pageLayoutId: 'test-layout',
            widgets: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
        ],
      };
    });
  };

  return (
    <StyledContainer containerWidth={containerWidth}>
      <PageLayoutTabListEffect
        tabs={sortedTabs}
        componentInstanceId="page-layout-tab-list-story"
      />

      <PageLayoutWidgetDndProvider>
        <StyledTabListContainer isInIdentifierBar={isInIdentifierBar}>
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
            pageLayoutType={
              isInIdentifierBar
                ? PageLayoutType.RECORD_PAGE
                : PageLayoutType.DASHBOARD
            }
            presentation={presentation}
            centerTabs={centerTabs}
          />
        </StyledTabListContainer>
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

export const IdentifierBar: Story = {
  args: {
    presentation: 'identifier-bar',
    isReorderEnabled: false,
  },
};

export const IdentifierBarCentered: Story = {
  args: {
    ...IdentifierBar.args,
    centerTabs: true,
  },
};

export const IdentifierBarNarrow: Story = {
  args: {
    presentation: 'identifier-bar',
    containerWidth: 240,
  },
};

export const IdentifierBarCenteredNarrow: Story = {
  args: {
    ...IdentifierBarNarrow.args,
    centerTabs: true,
  },
};
