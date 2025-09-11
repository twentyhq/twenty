import { WidgetContainer } from '@/page-layout/widgets/components/WidgetContainer';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { WidgetHeader } from '@/page-layout/widgets/components/WidgetHeader';
import { type Widget as WidgetType } from '@/page-layout/widgets/types/Widget';
import styled from '@emotion/styled';

type WidgetRendererProps = {
  widget: WidgetType;
  displayDragHandle?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
};

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
`;

export const WidgetRenderer = ({
  widget,
  displayDragHandle = false,
  onEdit,
  onRemove,
}: WidgetRendererProps) => {
  return (
    <WidgetContainer>
      <WidgetHeader
        displayDragHandle={displayDragHandle}
        title={widget.title}
        onEdit={onEdit}
        onRemove={onRemove}
      />
      <StyledContent>
        <WidgetContentRenderer widget={widget} />
      </StyledContent>
    </WidgetContainer>
  );
};
