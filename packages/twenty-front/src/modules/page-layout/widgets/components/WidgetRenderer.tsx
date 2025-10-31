import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useEditPageLayoutWidget } from '@/page-layout/hooks/useEditPageLayoutWidget';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { type PageLayoutTabLayoutMode } from '@/page-layout/types/PageLayoutTabLayoutMode';
import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { useWidgetPermissions } from '@/page-layout/widgets/hooks/useWidgetPermissions';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardContent } from '@/page-layout/widgets/widget-card/components/WidgetCardContent';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import { type MouseEvent } from 'react';
import { IconLock } from 'twenty-ui/display';
import { PageLayoutType, type PageLayoutWidget } from '~/generated/graphql';

type WidgetRendererProps = {
  widget: PageLayoutWidget;
  pageLayoutType: PageLayoutType;
  layoutMode: PageLayoutTabLayoutMode;
};

export const WidgetRenderer = ({
  widget,
  pageLayoutType,
  layoutMode,
}: WidgetRendererProps) => {
  const theme = useTheme();
  const { deletePageLayoutWidget } = useDeletePageLayoutWidget();
  const { handleEditWidget } = useEditPageLayoutWidget();

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const draggingWidgetId = useRecoilComponentValue(
    pageLayoutDraggingWidgetIdComponentState,
  );

  const currentlyEditingWidgetId = useRecoilComponentValue(
    pageLayoutEditingWidgetIdComponentState,
  );

  const isEditing = currentlyEditingWidgetId === widget.id;

  const isDragging = draggingWidgetId === widget.id;

  const { hasAccess, restriction } = useWidgetPermissions(widget);

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

  return (
    <WidgetCard
      onClick={isPageLayoutInEditMode ? handleClick : undefined}
      isDragging={isDragging}
      pageLayoutType={pageLayoutType}
      layoutMode={layoutMode}
      isEditing={isEditing}
    >
      {layoutMode !== 'canvas' && (
        <WidgetCardHeader
          isInEditMode={isPageLayoutInEditMode}
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

      <WidgetCardContent
        pageLayoutType={pageLayoutType}
        layoutMode={layoutMode}
      >
        {hasAccess && <WidgetContentRenderer widget={widget} />}
        {!hasAccess && pageLayoutType === PageLayoutType.DASHBOARD && (
          <IconLock
            color={theme.font.color.tertiary}
            stroke={theme.icon.stroke.sm}
          />
        )}
      </WidgetCardContent>
    </WidgetCard>
  );
};
