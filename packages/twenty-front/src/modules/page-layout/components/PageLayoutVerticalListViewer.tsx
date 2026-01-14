import { usePageLayoutShouldUseWhiteBackground } from '@/page-layout/hooks/usePageLayoutShouldUseWhiteBackground';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
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
  const { shouldUseWhiteBackground } = usePageLayoutShouldUseWhiteBackground();

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
