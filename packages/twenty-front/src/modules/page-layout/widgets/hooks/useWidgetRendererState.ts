import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useIsSideColumnContext } from '@/page-layout/hooks/useIsSideColumnContext';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutResizingWidgetIdComponentState } from '@/page-layout/states/pageLayoutResizingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WIDGET_TYPES_WITH_ALWAYS_VISIBLE_SOLO_HEADER } from '@/page-layout/widgets/constants/WidgetTypesWithAlwaysVisibleSoloHeader';
import { useWidgetPermissions } from '@/page-layout/widgets/hooks/useWidgetPermissions';
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { widgetHasHeaderCountComponentFamilySelector } from '@/page-layout/widgets/states/selectors/widgetHasHeaderCountComponentFamilySelector';
import { getWidgetCardVariant } from '@/page-layout/widgets/utils/getWidgetCardVariant';
import { useOpenWidgetSettingsInSidePanel } from '@/side-panel/hooks/useOpenWidgetSettingsInSidePanel';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { type MouseEvent } from 'react';
import { WidgetType } from '~/generated-metadata/graphql';

export const useWidgetRendererState = (widget: PageLayoutWidget) => {
  const { deletePageLayoutWidget } = useDeletePageLayoutWidget();
  const { openWidgetSettingsInSidePanel } = useOpenWidgetSettingsInSidePanel();

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const pageLayoutDraggingWidgetId = useAtomComponentStateValue(
    pageLayoutDraggingWidgetIdComponentState,
  );

  const pageLayoutResizingWidgetId = useAtomComponentStateValue(
    pageLayoutResizingWidgetIdComponentState,
  );

  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
  );

  const isEditing = pageLayoutEditingWidgetId === widget.id;
  const isDragging = pageLayoutDraggingWidgetId === widget.id;
  const isResizing = pageLayoutResizingWidgetId === widget.id;

  const { hasAccess, restriction } = useWidgetPermissions(widget);

  const { isSideColumnContext } = useIsSideColumnContext();

  const { presentation } = usePageLayoutContentContext();

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const isHeaderHiddenInViewMode =
    widget.type === WidgetType.STANDALONE_RICH_TEXT ||
    widget.type === WidgetType.EMAIL_THREAD ||
    widget.type === WidgetType.MESSAGE_CAMPAIGN_BODY ||
    widget.type === WidgetType.MESSAGE_CAMPAIGN_DETAILS ||
    widget.type === WidgetType.WORKFLOW ||
    widget.type === WidgetType.WORKFLOW_VERSION ||
    widget.type === WidgetType.WORKFLOW_RUN;
  const hideHeaderInViewMode =
    isHeaderHiddenInViewMode && !isPageLayoutInEditMode;

  const hasWidgetHeaderCount = useAtomComponentFamilySelectorValue(
    widgetHasHeaderCountComponentFamilySelector,
    widget.id,
  );

  const hasWidgetHeaderInfo =
    hasWidgetHeaderCount ||
    WIDGET_TYPES_WITH_ALWAYS_VISIBLE_SOLO_HEADER.includes(widget.type);

  const showHeader =
    presentation === 'solo' ? hasWidgetHeaderInfo : !hideHeaderInViewMode;

  const handleClick = () => {
    openWidgetSettingsInSidePanel({
      widgetId: widget.id,
      widgetType: widget.type,
    });
  };

  const handleRemove = (e?: MouseEvent) => {
    e?.stopPropagation();
    deletePageLayoutWidget(widget.id);
  };

  const setWidgetCardHovered = useSetAtomComponentFamilyState(
    widgetCardHoveredComponentFamilyState,
    widget.id,
  );

  const handleMouseEnter = () => {
    setWidgetCardHovered(true);
  };

  const handleMouseLeave = () => {
    setWidgetCardHovered(false);
  };

  const variant = getWidgetCardVariant({
    isSideColumnContext,
    pageLayoutType: currentPageLayout.type,
  });

  return {
    isPageLayoutInEditMode,
    isEditing,
    isDragging,
    isResizing,
    hasAccess,
    restriction,
    showHeader,
    variant,
    handleClick,
    handleRemove,
    handleMouseEnter,
    handleMouseLeave,
  };
};
