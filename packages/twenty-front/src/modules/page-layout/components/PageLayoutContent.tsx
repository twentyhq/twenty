import { PageLayoutCanvasViewer } from '@/page-layout/components/PageLayoutCanvasViewer';
import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { PageLayoutVerticalListEditor } from '@/page-layout/components/PageLayoutVerticalListEditor';
import { PageLayoutVerticalListViewer } from '@/page-layout/components/PageLayoutVerticalListViewer';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useReorderPageLayoutWidgets } from '@/page-layout/hooks/useReorderPageLayoutWidgets';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';

const StyledContainer = styled.div<{ isInPinnedTab: boolean }>`
  background: ${({ theme }) => theme.background.primary};
  box-sizing: border-box;
  flex: 1;
  min-height: 100%;
  position: relative;
  width: 100%;
  padding: ${({ theme, isInPinnedTab }) =>
    isInPinnedTab ? 0 : theme.spacing(2)};
`;

export const PageLayoutContent = () => {
  const isRecordPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_ENABLED,
  );

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const { currentPageLayout } = useCurrentPageLayout();
  const { tabId } = usePageLayoutContentContext();

  const { reorderWidgets } = useReorderPageLayoutWidgets(tabId);

  const activeTab = currentPageLayout?.tabs.find((tab) => tab.id === tabId);

  const { layoutMode } = usePageLayoutContentContext();
  const { isInPinnedTab } = useIsInPinnedTab();

  if (!isDefined(currentPageLayout) || !isDefined(activeTab)) {
    return null;
  }

  const isCanvasLayout = isRecordPageEnabled && layoutMode === 'canvas';
  const isVerticalList = isRecordPageEnabled && layoutMode === 'vertical-list';

  if (isCanvasLayout) {
    return <PageLayoutCanvasViewer widgets={activeTab.widgets} />;
  }

  if (isVerticalList) {
    return (
      <StyledContainer isInPinnedTab={isInPinnedTab}>
        {isPageLayoutInEditMode ? (
          <PageLayoutVerticalListEditor
            widgets={activeTab.widgets}
            onReorder={reorderWidgets}
          />
        ) : (
          <PageLayoutVerticalListViewer widgets={activeTab.widgets} />
        )}
      </StyledContainer>
    );
  }

  return <PageLayoutGridLayout tabId={tabId} />;
};
