import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { shouldWidgetFillCanvasTab } from '@/page-layout/utils/shouldWidgetFillCanvasTab';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

// The minmax(0, 1fr) row keeps the height definite so a canvas widget can
// fill the visible tab area and manage its own internal scroll. Other solo
// tabs keep the content-sized auto row so long content (e.g. rich text)
// still flows into the tab's scroll wrapper.
const StyledSoloContainer = styled.div<{ fillsTab: boolean }>`
  display: grid;
  grid-template-rows: ${({ fillsTab }) =>
    fillsTab ? 'minmax(0, 1fr)' : 'auto'};
  height: 100%;
`;

type PageLayoutSoloViewerProps = {
  widgets: PageLayoutWidget[];
};

export const PageLayoutSoloViewer = ({
  widgets,
}: PageLayoutSoloViewerProps) => {
  const { layoutMode } = usePageLayoutContentContext();

  const widget = widgets.at(0);

  if (!isDefined(widget)) {
    return null;
  }

  return (
    <StyledSoloContainer
      fillsTab={shouldWidgetFillCanvasTab({ widget, layoutMode })}
    >
      <WidgetRenderer widget={widget} />
    </StyledSoloContainer>
  );
};
