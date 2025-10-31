import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType, type PageLayoutWidget } from '~/generated/graphql';

const StyledCanvasContainer = styled.div`
  display: grid;
  height: 100%;
`;

type PageLayoutCanvasViewerProps = {
  widgets: PageLayoutWidget[];
};

export const PageLayoutCanvasViewer = ({
  widgets,
}: PageLayoutCanvasViewerProps) => {
  const widget = widgets.at(0);

  if (!isDefined(widget)) {
    throw new Error('No widget found in canvas layout');
  }

  return (
    <StyledCanvasContainer>
      <WidgetRenderer
        widget={widget}
        pageLayoutType={PageLayoutType.RECORD_PAGE}
        layoutMode="canvas"
      />
    </StyledCanvasContainer>
  );
};
