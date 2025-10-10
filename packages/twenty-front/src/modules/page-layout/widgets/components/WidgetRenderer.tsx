import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useEditPageLayoutWidget } from '@/page-layout/hooks/useEditPageLayoutWidget';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { PageLayoutWidgetForbiddenDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetForbiddenDisplay';
import { WidgetContainer } from '@/page-layout/widgets/components/WidgetContainer';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { WidgetHeader } from '@/page-layout/widgets/components/WidgetHeader';
import { useWidgetPermissions } from '@/page-layout/widgets/hooks/useWidgetPermissions';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { type MouseEvent } from 'react';
import { type PageLayoutWidget } from '~/generated/graphql';

type WidgetRendererProps = {
  widget: PageLayoutWidget;
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
  );

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
    <WidgetContainer
      isRestricted={!hasAccess}
      onClick={isPageLayoutInEditMode ? handleClick : undefined}
    >
      <WidgetHeader
        isInEditMode={isPageLayoutInEditMode}
        title={widget.title}
        onRemove={handleRemove}
      />
      <StyledContent>
        {!hasAccess ? (
          <PageLayoutWidgetForbiddenDisplay
            widgetId={widget.id}
            restriction={restriction}
          />
        ) : (
          <WidgetContentRenderer widget={widget} />
        )}
      </StyledContent>
    </WidgetContainer>
  );
};
