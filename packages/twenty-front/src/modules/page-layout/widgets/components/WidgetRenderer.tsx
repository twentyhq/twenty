import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useEditPageLayoutWidget } from '@/page-layout/hooks/useEditPageLayoutWidget';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { useWidgetPermissions } from '@/page-layout/widgets/hooks/useWidgetPermissions';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardContent } from '@/page-layout/widgets/widget-card/components/WidgetCardContent';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { type WidgetCardContext } from '@/page-layout/widgets/widget-card/types/WidgetCardContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type MouseEvent } from 'react';
import { type PageLayoutWidget } from '~/generated/graphql';

type WidgetRendererProps = {
  widget: PageLayoutWidget;
  context?: WidgetCardContext;
};

export const WidgetRenderer = ({
  widget,
  context = 'dashboard',
}: WidgetRendererProps) => {
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
      context={context}
      isEditing={isEditing}
    >
      <WidgetCardHeader
        isInEditMode={isPageLayoutInEditMode}
        title={widget.title}
        onRemove={handleRemove}
        isDragging={isDragging}
        context={context}
        hasAccess={hasAccess}
        isEditing={isEditing}
      />
      <WidgetCardContent context={context}>
        {!hasAccess ? (
          <PageLayoutWidgetForbiddenDisplay
            widgetId={widget.id}
            restriction={restriction}
          />
        ) : (
          <WidgetContentRenderer widget={widget} />
        )}
      </WidgetCardContent>
    </WidgetCard>
  );
};
