import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { useCreatePageLayoutTab } from '@/page-layout/hooks/useCreatePageLayoutTab';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useReorderPageLayoutTabs } from '@/page-layout/hooks/useReorderPageLayoutTabs';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: ${({ theme }) => theme.background.primary};
`;

const StyledTabList = styled(TabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  flex: 1;
`;

export const PageLayoutRendererContent = () => {
  const { currentPageLayout } = useCurrentPageLayout();

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const { createPageLayoutTab } = useCreatePageLayoutTab(currentPageLayout?.id);
  const { handleReorderTabs } = useReorderPageLayoutTabs(
    currentPageLayout?.id ?? '',
  );

  const handleAddTab = isPageLayoutInEditMode ? createPageLayoutTab : undefined;

  if (!isDefined(currentPageLayout)) {
    return null;
  }

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutId(
    currentPageLayout.id,
  );

  const sortedTabs = [...currentPageLayout.tabs].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <StyledContainer>
      <StyledTabList
        tabs={sortedTabs}
        behaveAsLinks={false}
        componentInstanceId={tabListInstanceId}
        onAddTab={handleAddTab}
        isDraggable={isPageLayoutInEditMode}
        onDragEnd={isPageLayoutInEditMode ? handleReorderTabs : undefined}
      />
      <StyledScrollWrapper
        componentInstanceId={`scroll-wrapper-page-layout-${currentPageLayout.id}`}
        defaultEnableXScroll={false}
      >
        <PageLayoutGridLayout />
      </StyledScrollWrapper>
    </StyledContainer>
  );
};
