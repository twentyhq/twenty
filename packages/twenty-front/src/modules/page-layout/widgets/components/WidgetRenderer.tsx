import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useEditPageLayoutWidget } from '@/page-layout/hooks/useEditPageLayoutWidget';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutResizingWidgetIdComponentState } from '@/page-layout/states/pageLayoutResizingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { useIsInPinnedTab } from '@/page-layout/widgets/hooks/useIsInPinnedTab';
import { useWidgetPermissions } from '@/page-layout/widgets/hooks/useWidgetPermissions';
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { getWidgetCardVariant } from '@/page-layout/widgets/utils/getWidgetCardVariant';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardContent } from '@/page-layout/widgets/widget-card/components/WidgetCardContent';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyState';
import { useTheme } from '@emotion/react';
import { type MouseEvent } from 'react';
import { IconLock } from 'twenty-ui/display';
import { WidgetType } from '~/generated/graphql';

type WidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const WidgetRenderer = ({ widget }: WidgetRendererProps) => {
  const theme = useTheme();
  const { deletePageLayoutWidget } = useDeletePageLayoutWidget();
  const { handleEditWidget } = useEditPageLayoutWidget();

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const draggingWidgetId = useRecoilComponentValue(
    pageLayoutDraggingWidgetIdComponentState,
  );

  const resizingWidgetId = useRecoilComponentValue(
    pageLayoutResizingWidgetIdComponentState,
  );

  const currentlyEditingWidgetId = useRecoilComponentValue(
    pageLayoutEditingWidgetIdComponentState,
  );

  const isEditing = currentlyEditingWidgetId === widget.id;

  const isDragging = draggingWidgetId === widget.id;

  const isResizing = resizingWidgetId === widget.id;

  const { hasAccess, restriction } = useWidgetPermissions(widget);

  const { layoutMode } = usePageLayoutContentContext();
  const { isInPinnedTab } = useIsInPinnedTab();

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  // TODO: when we have more widgets without headers, we should use a more generic approach to hide the header
  // each widget type could have metadata (e.g., hasHeader: boolean or headerMode: 'always' | 'editOnly' | 'never')
  const isRichTextWidget = widget.type === WidgetType.STANDALONE_RICH_TEXT;
  const hideRichTextHeader = isRichTextWidget && !isPageLayoutInEditMode;

  const showHeader =
    layoutMode !== 'canvas' && !isInPinnedTab && !hideRichTextHeader;

  const handleClick = () => {
    handleEditWidget({
      widgetId: widget.id,
      widgetType: widget.type,
    });
  };

  const handleRemove = (e?: MouseEvent) => {
    e?.stopPropagation();
    deletePageLayoutWidget(widget.id);
  };

  const setIsHovered = useSetRecoilComponentFamilyState(
    widgetCardHoveredComponentFamilyState,
    widget.id,
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const variant = getWidgetCardVariant({
    layoutMode,
    isInPinnedTab,
    pageLayoutType: currentPageLayout.type,
  });

  return (
    <WidgetCard
      headerLess={!showHeader}
      variant={variant}
      isEditable={isPageLayoutInEditMode}
      onClick={isPageLayoutInEditMode ? handleClick : undefined}
      isEditing={isEditing}
      isDragging={isDragging}
      isResizing={isResizing}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-widget-id={widget.id}
    >
      {showHeader && (
        <WidgetCardHeader
          widgetId={widget.id}
          isInEditMode={isPageLayoutInEditMode}
          isResizing={isResizing}
          title={widget.title}
          onRemove={handleRemove}
          forbiddenDisplay={
            !hasAccess && (
              <PageLayoutWidgetForbiddenDisplay
                widgetId={widget.id}
                restriction={restriction}
              />
            )
          }
        />
      )}

      <WidgetCardContent variant={variant}>
        {hasAccess && <WidgetContentRenderer widget={widget} />}
        {!hasAccess && (
          <IconLock
            color={theme.font.color.tertiary}
            stroke={theme.icon.stroke.sm}
          />
        )}
      </WidgetCardContent>
    </WidgetCard>
  );
};
