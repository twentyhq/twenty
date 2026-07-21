import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { RecordPageAddWidgetSection } from '@/page-layout/widgets/components/RecordPageAddWidgetSection';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { getWidgetDisplayProfile } from '@/page-layout/widgets/utils/getWidgetDisplayProfile';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

// Fill widgets own the whole viewport and scroll internally; flow widgets render
// at their natural height and let the page scroll around them.
const StyledFillContainer = styled.div`
  display: grid;
  height: 100%;
`;

const StyledFlowContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

type PageLayoutSoloViewerProps = {
  widgets: PageLayoutWidget[];
};

export const PageLayoutSoloViewer = ({
  widgets,
}: PageLayoutSoloViewerProps) => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const { layoutType } = useLayoutRenderingContext();

  const widget = widgets.at(0);

  if (!isDefined(widget)) {
    return null;
  }

  const { scrollStrategy } = getWidgetDisplayProfile(widget.type);

  const isRecordPage = layoutType === PageLayoutType.RECORD_PAGE;
  const showAddWidget = isPageLayoutInEditMode && isRecordPage;

  if (scrollStrategy === 'fill' && !showAddWidget) {
    return (
      <StyledFillContainer>
        <WidgetRenderer widget={widget} />
      </StyledFillContainer>
    );
  }

  return (
    <StyledFlowContainer>
      <WidgetRenderer widget={widget} />
      {showAddWidget && <RecordPageAddWidgetSection />}
    </StyledFlowContainer>
  );
};
