import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { ChartSettings } from '@/side-panel/pages/page-layout/components/ChartSettings';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/side-panel/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { isChartWidget } from '@/side-panel/pages/page-layout/utils/isChartWidget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const SidePanelPageLayoutChartSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const widgetInEditMode = pageLayoutDraft.tabs
    .flatMap((tab) => tab.widgets)
    .find((widget) => widget.id === pageLayoutEditingWidgetId);

  if (!isDefined(widgetInEditMode) || !isChartWidget(widgetInEditMode)) {
    return null;
  }

  return (
    <StyledContainer>
      <WidgetComponentInstanceContext.Provider
        value={{ instanceId: widgetInEditMode.id }}
      >
        <ChartSettings widget={widgetInEditMode} />
        <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
      </WidgetComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
