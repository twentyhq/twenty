import { ForbiddenFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ForbiddenFieldDisplay';
import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useEditPageLayoutWidget } from '@/page-layout/hooks/useEditPageLayoutWidget';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { WidgetContainer } from '@/page-layout/widgets/components/WidgetContainer';
import { WidgetContentRenderer } from '@/page-layout/widgets/components/WidgetContentRenderer';
import { WidgetHeader } from '@/page-layout/widgets/components/WidgetHeader';
import { useWidgetObjectPermissions } from '@/page-layout/widgets/hooks/useWidgetObjectPermissions';
import { type PageLayoutWidget } from '~/generated/graphql';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';

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
  const { haveAccessToWidgetsObject } = useWidgetObjectPermissions(widget);

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  return (
    <WidgetContainer isRestricted={!haveAccessToWidgetsObject}>
      <WidgetHeader
        isInEditMode={isPageLayoutInEditMode}
        title={widget.title}
        onEdit={() =>
          handleEditWidget({ widgetId: widget.id, widgetType: widget.type })
        }
        onRemove={() => deletePageLayoutWidget(widget.id)}
      />
      <StyledContent>
        {!haveAccessToWidgetsObject ? (
          <ForbiddenFieldDisplay />
        ) : (
          <WidgetContentRenderer widget={widget} />
        )}
      </StyledContent>
    </WidgetContainer>
  );
};
