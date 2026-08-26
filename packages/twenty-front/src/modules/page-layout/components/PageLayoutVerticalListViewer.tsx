import { styled } from '@linaria/react';
import { useIsMobile } from 'twenty-ui/utilities';

import { getPageLayoutVerticalListViewerVariant } from '@/page-layout/components/utils/getPageLayoutVerticalListViewerVariant';
import { type PageLayoutVerticalListViewerVariant } from '@/page-layout/types/PageLayoutVerticalListViewerVariant';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledVerticalListContainer = styled.div<{
  variant: PageLayoutVerticalListViewerVariant;
  shouldUseWhiteBackground: boolean;
  isInPinnedTab: boolean;
}>`
  background: ${({ shouldUseWhiteBackground }) =>
    shouldUseWhiteBackground
      ? themeCssVariables.background.primary
      : themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${({ variant }) =>
    variant === 'side-column' ? 0 : themeCssVariables.spacing[2]};
  // The pinned tab sits next to the main tab area, so it takes that area's
  // vertical padding to line their widgets up, and keeps the flush side-column
  // edges horizontally where the narrow column needs the room.
  padding: ${({ variant, isInPinnedTab }) =>
    isInPinnedTab
      ? `${themeCssVariables.spacing[2]} 0`
      : variant === 'side-column'
        ? 0
        : themeCssVariables.spacing[2]};
`;

type PageLayoutVerticalListViewerProps = {
  widgets: PageLayoutWidget[];
};

export const PageLayoutVerticalListViewer = ({
  widgets,
}: PageLayoutVerticalListViewerProps) => {
  const { isInSidePanel } = useLayoutRenderingContext();
  const isMobile = useIsMobile();
  const { isInPinnedTab } = useIsInPinnedTab();

  const variant = getPageLayoutVerticalListViewerVariant({
    isInPinnedTab,
    isMobile,
    isInSidePanel,
  });

  return (
    <StyledVerticalListContainer
      variant={variant}
      shouldUseWhiteBackground={!isInPinnedTab || isMobile}
      isInPinnedTab={isInPinnedTab}
    >
      {widgets.map((widget) => (
        <div key={widget.id}>
          <WidgetRenderer widget={widget} />
        </div>
      ))}
    </StyledVerticalListContainer>
  );
};
