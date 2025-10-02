import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
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

const StyledScrollWrapper = styled(ScrollWrapper)`
  flex: 1;
`;

export const PageLayoutRendererContent = () => {
  const { currentPageLayout } = useCurrentPageLayout();

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  if (!isDefined(currentPageLayout)) {
    return null;
  }

  return (
    <StyledContainer>
      <PageLayoutTabList
        pageLayoutId={currentPageLayout.id}
        isInEditMode={isPageLayoutInEditMode}
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
