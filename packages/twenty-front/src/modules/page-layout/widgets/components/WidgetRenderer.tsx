import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetCardShell } from '@/page-layout/widgets/components/WidgetCardShell';
import { useWidgetRendererState } from '@/page-layout/widgets/hooks/useWidgetRendererState';

type WidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const WidgetRenderer = ({ widget }: WidgetRendererProps) => {
  const state = useWidgetRendererState(widget);

  const isWidgetEditable = state.isPageLayoutInEditMode;

  return (
    <WidgetCardShell
      widget={widget}
      variant={state.variant}
      isEditable={isWidgetEditable}
      isEditing={state.isEditing}
      isDragging={state.isDragging}
      isResizing={state.isResizing}
      showHeader={state.showHeader}
      hasAccess={state.hasAccess}
      restriction={state.restriction}
      onClick={isWidgetEditable ? state.handleClick : undefined}
      onRemove={state.handleRemove}
      onMouseEnter={state.handleMouseEnter}
      onMouseLeave={state.handleMouseLeave}
    />
  );
};
