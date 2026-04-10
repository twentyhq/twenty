import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetCardShell } from '@/page-layout/widgets/components/WidgetCardShell';
import { useWidgetRendererState } from '@/page-layout/widgets/hooks/useWidgetRendererState';

type NonRecordPageWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const NonRecordPageWidgetRenderer = ({
  widget,
}: NonRecordPageWidgetRendererProps) => {
  const state = useWidgetRendererState(widget);

  return (
    <WidgetCardShell
      widget={widget}
      variant={state.variant}
      isEditable={state.isPageLayoutInEditMode}
      isEditing={state.isEditing}
      isDragging={state.isDragging}
      isResizing={state.isResizing}
      isLastWidget={state.isLastWidget}
      showHeader={state.showHeader}
      hasAccess={state.hasAccess}
      restriction={state.restriction}
      actions={[]}
      isReorderEnabled={true}
      isDeletingWidgetEnabled={true}
      onClick={state.isPageLayoutInEditMode ? state.handleClick : undefined}
      onRemove={state.handleRemove}
      onMouseEnter={state.handleMouseEnter}
      onMouseLeave={state.handleMouseLeave}
    />
  );
};
