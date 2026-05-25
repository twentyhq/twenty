import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetCardShell } from '@/page-layout/widgets/components/WidgetCardShell';
import { useWidgetActions } from '@/page-layout/widgets/hooks/useWidgetActions';
import { useWidgetRendererState } from '@/page-layout/widgets/hooks/useWidgetRendererState';

type RecordPageWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const RecordPageWidgetRenderer = ({
  widget,
}: RecordPageWidgetRendererProps) => {
  const state = useWidgetRendererState(widget);

  const isWidgetEditable = state.isPageLayoutInEditMode;

  const actions = useWidgetActions({ widget });

  const isCanvasVariant = state.variant === 'canvas';

  return (
    <WidgetCardShell
      widget={widget}
      variant={state.variant}
      isEditable={isWidgetEditable}
      isEditing={state.isEditing}
      isDragging={state.isDragging}
      isResizing={state.isResizing}
      isLastWidget={state.isLastWidget}
      showHeader={state.showHeader}
      hasAccess={state.hasAccess}
      restriction={state.restriction}
      actions={actions}
      isInVerticalListTab={state.isInVerticalListTab}
      isMobile={state.isMobile}
      isReorderEnabled={true}
      isDeletingWidgetEnabled={true}
      onClick={isWidgetEditable ? state.handleClick : undefined}
      onRemove={state.handleRemove}
      onMouseEnter={isCanvasVariant ? undefined : state.handleMouseEnter}
      onMouseLeave={isCanvasVariant ? undefined : state.handleMouseLeave}
    />
  );
};
