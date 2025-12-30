import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import styled from '@emotion/styled';

const StyledVerticalListContainer = styled.div`
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
  return (
    <StyledVerticalListContainer>
      {widgets.map((widget) => (
        <div key={widget.id}>
          <WidgetRenderer widget={widget} />
        </div>
      ))}
    </StyledVerticalListContainer>
  );
};
