import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { getWidgetHeightMode } from '@/page-layout/widgets/utils/getWidgetHeightMode';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const StyledSoloContainer = styled.div<{ isFillingWidget: boolean }>`
  display: grid;
  grid-template-rows: ${({ isFillingWidget }) =>
    isFillingWidget ? 'minmax(0, 1fr)' : 'auto'};
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
    <StyledSoloContainer
      isFillingWidget={getWidgetHeightMode({ widget }) === 'filling'}
    >
      <WidgetRenderer widget={widget} />
    </StyledSoloContainer>
  );
};
