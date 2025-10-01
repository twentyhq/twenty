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
  const { hasAccess, restriction } = useWidgetPermissions(widget);

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  return (
    <WidgetContainer isRestricted={!hasAccess}>
      <WidgetHeader
        isInEditMode={isPageLayoutInEditMode}
        title={widget.title}
        onEdit={() =>
          handleEditWidget({ widgetId: widget.id, widgetType: widget.type })
        }
        onRemove={() => deletePageLayoutWidget(widget.id)}
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
