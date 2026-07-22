import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const StyledSoloContainer = styled.div`
  display: grid;
  height: 100%;
`;

type PageLayoutSoloViewerProps = {
  widgets: PageLayoutWidget[];
};

export const PageLayoutSoloViewer = ({
  widgets,
}: PageLayoutSoloViewerProps) => {
  const widget = widgets.at(0);

  if (!isDefined(widget)) {
    return null;
  }

  return (
    <StyledSoloContainer>
      <WidgetRenderer widget={widget} />
    </StyledSoloContainer>
  );
};
