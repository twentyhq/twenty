import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';

const StyledVerticalListContainer = styled.div<{
  shouldUseWhiteBackground: boolean;
}>`
  background: ${({ theme, shouldUseWhiteBackground }) =>
    shouldUseWhiteBackground
      ? theme.background.primary
      : theme.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type PageLayoutVerticalListViewerProps = {
  widgets: PageLayoutWidget[];
};

export const PageLayoutVerticalListViewer = ({
  widgets,
}: PageLayoutVerticalListViewerProps) => {
  const isMobile = useIsMobile();
  const { isInRightDrawer } = useLayoutRenderingContext();
  const { isInPinnedTab } = useIsInPinnedTab();

  const shouldUseWhiteBackground =
    (isMobile || isInRightDrawer) && !isInPinnedTab;

  return (
    <StyledVerticalListContainer
      shouldUseWhiteBackground={shouldUseWhiteBackground}
    >
      {widgets.map((widget) => (
        <div key={widget.id}>
          <WidgetRenderer widget={widget} />
        </div>
      ))}
    </StyledVerticalListContainer>
  );
};
