import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';

export const DashboardWidgetPlaceholder = () => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
  );

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const handleClick = () => {
    if (isLayoutCustomizationModeEnabled) {
      return;
    }

    if (!isPageLayoutInEditMode) {
      setIsPageLayoutInEditMode(true);
    }
    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutDashboardWidgetTypeSelect,
      resetNavigationStack: true,
    });
  };

  return (
    <WidgetCard
      variant="framed"
      isEditable={true}
      isEditing={false}
      isDragging={false}
      isResizing={false}
      onClick={handleClick}
      className="widget"
    >
      <WidgetCardHeader
        variant="framed"
        widgetId="widget-placeholder"
        isInEditMode={isPageLayoutInEditMode}
        isResizing={false}
        title={t`Add Widget`}
        isEmpty
      />
      <EmptyState.Root>
        <AnimatedPlaceholder type="noWidgets" />
        <EmptyState.Content>
          <EmptyState.Title>
            <Trans>Add widget</Trans>
          </EmptyState.Title>
          <EmptyState.Description>
            <Trans>Click to add your first widget</Trans>
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    </WidgetCard>
  );
};
