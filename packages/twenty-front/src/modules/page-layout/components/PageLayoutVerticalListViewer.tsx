import styled from '@emotion/styled';
import { useIsMobile } from 'twenty-ui/utilities';

import { getPageLayoutVerticalListViewerVariant } from '@/page-layout/components/utils/getPageLayoutVerticalListViewerVariant';
import { usePageLayoutShouldUseWhiteBackground } from '@/page-layout/hooks/usePageLayoutShouldUseWhiteBackground';
import { type PageLayoutVerticalListViewerVariant } from '@/page-layout/types/PageLayoutVerticalListViewerVariant';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';

const StyledVerticalListContainer = styled.div<{
  shouldUseWhiteBackground: boolean;
  variant: PageLayoutVerticalListViewerVariant;
}>`
  background: ${({ theme, shouldUseWhiteBackground }) =>
    shouldUseWhiteBackground
      ? theme.background.primary
      : theme.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme, variant }) =>
    variant === 'side-column' ? 0 : theme.spacing(2)};
`;

type PageLayoutVerticalListViewerProps = {
  widgets: PageLayoutWidget[];
};

export const PageLayoutVerticalListViewer = ({
  widgets,
}: PageLayoutVerticalListViewerProps) => {
  const { shouldUseWhiteBackground } = usePageLayoutShouldUseWhiteBackground();
  const { isInRightDrawer } = useLayoutRenderingContext();
  const isMobile = useIsMobile();
  const { isInPinnedTab } = useIsInPinnedTab();

  const variant = getPageLayoutVerticalListViewerVariant({
    isInPinnedTab,
    isMobile,
    isInRightDrawer,
  });

  return (
    <StyledVerticalListContainer
      shouldUseWhiteBackground={shouldUseWhiteBackground}
      variant={variant}
    >
      {widgets.map((widget) => (
        <div key={widget.id}>
          <WidgetRenderer widget={widget} />
        </div>
      ))}
    </StyledVerticalListContainer>
  );
};
