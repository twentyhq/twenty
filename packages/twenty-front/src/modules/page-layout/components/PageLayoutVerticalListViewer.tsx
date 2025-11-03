import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import styled from '@emotion/styled';
import { PageLayoutType, type PageLayoutWidget } from '~/generated/graphql';

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
          <WidgetRenderer
            widget={widget}
            pageLayoutType={PageLayoutType.RECORD_PAGE}
            layoutMode="vertical-list"
          />
        </div>
      ))}
    </StyledVerticalListContainer>
  );
};
