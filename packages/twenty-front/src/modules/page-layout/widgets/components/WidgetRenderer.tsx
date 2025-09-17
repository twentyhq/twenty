import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useEditPageLayoutWidget } from '@/page-layout/hooks/useEditPageLayoutWidget';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { WidgetContainer } from '@/page-layout/widgets/components/WidgetContainer';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { WidgetHeader } from '@/page-layout/widgets/components/WidgetHeader';
import { WidgetNoAccessContent } from '@/page-layout/widgets/components/WidgetNoAccessContent';
import { type Widget as WidgetType } from '@/page-layout/widgets/types/Widget';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';

type WidgetRendererProps = {
  widget: WidgetType;
};

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
`;

export const WidgetRenderer = ({ widget }: WidgetRendererProps) => {
  const { deletePageLayoutWidget } = useDeletePageLayoutWidget();
  const { handleEditWidget } = useEditPageLayoutWidget();

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
    widget.id,
  );

  const showRestrictedContent = widget.canReadWidget === false;

  return (
    <WidgetContainer isRestricted={showRestrictedContent}>
      <WidgetHeader
        isInEditMode={isPageLayoutInEditMode}
        title={widget.title}
        onEdit={
          showRestrictedContent
            ? undefined
            : () =>
                handleEditWidget({
                  widgetId: widget.id,
                  widgetType: widget.type,
                })
        }
        onRemove={() => deletePageLayoutWidget(widget.id)}
      />
      <StyledContent>
        {showRestrictedContent ? (
          <WidgetNoAccessContent />
        ) : (
          <WidgetContentRenderer widget={widget} />
        )}
      </StyledContent>
    </WidgetContainer>
  );
};
