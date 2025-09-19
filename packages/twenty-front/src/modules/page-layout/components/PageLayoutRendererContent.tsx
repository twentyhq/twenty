import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
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

  if (!isDefined(currentPageLayout)) {
    return null;
  }

  return (
    <StyledContainer>
      <StyledTabList
        tabs={currentPageLayout.tabs}
        behaveAsLinks={false}
        componentInstanceId={getTabListInstanceIdFromPageLayoutId(
          currentPageLayout.id,
        )}
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
