import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useEditPageLayoutWidget } from '@/page-layout/hooks/useEditPageLayoutWidget';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
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

  const pageLayoutEditingWidgetId = useRecoilComponentValue(
    pageLayoutEditingWidgetIdComponentState,
  );

  const pageLayoutDraft = useRecoilComponentValue(
    pageLayoutDraftComponentState,
  );

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const isCurrentlyBeingEdited = widget.id === pageLayoutEditingWidgetId;
  const widgetToRender = isCurrentlyBeingEdited
    ? (pageLayoutDraft.tabs
        .flatMap((tab) => tab.widgets)
        .find((w) => w.id === widget.id) ?? widget)
    : widget;

  const { hasAccess, restriction } = useWidgetPermissions(widgetToRender);

  return (
    <WidgetContainer isRestricted={!hasAccess}>
      <WidgetHeader
        isInEditMode={isPageLayoutInEditMode}
        title={widgetToRender.title}
        onEdit={() =>
          handleEditWidget({
            widgetId: widgetToRender.id,
            widgetType: widgetToRender.type,
          })
        }
        onRemove={() => deletePageLayoutWidget(widgetToRender.id)}
      />
      <StyledContent>
        {!hasAccess ? (
          <PageLayoutWidgetForbiddenDisplay
            widgetId={widgetToRender.id}
            restriction={restriction}
          />
        ) : (
          <WidgetContentRenderer widget={widgetToRender} />
        )}
      </StyledContent>
    </WidgetContainer>
  );
};
