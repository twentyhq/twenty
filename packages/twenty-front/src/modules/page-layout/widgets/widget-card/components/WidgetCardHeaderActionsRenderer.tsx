import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useCurrentWidgetOrNull } from '@/page-layout/widgets/hooks/useCurrentWidgetOrNull';
import { getWidgetHeaderActionDefinition } from '@/page-layout/widgets/utils/getWidgetHeaderActionDefinition';
import { WidgetHeaderCommandMenuItems } from '@/page-layout/widgets/widget-card/components/WidgetHeaderCommandMenuItems';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { WidgetType } from '~/generated-metadata/graphql';

const StyledActionsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const WidgetCardHeaderActionsRenderer = () => {
  const widget = useCurrentWidgetOrNull();
  const { targetRecordIdentifier } = useLayoutRenderingContext();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  if (!isDefined(widget) || !isDefined(targetRecordIdentifier)) {
    return null;
  }

  // Activity actions create records, so they hide while arranging; field widget actions handle their own visibility.
  if (isPageLayoutInEditMode && widget.type !== WidgetType.FIELD) {
    return null;
  }

  const headerActionDefinition = getWidgetHeaderActionDefinition(widget);

  if (!isDefined(headerActionDefinition)) {
    return null;
  }

  if (headerActionDefinition.kind === 'command-menu-items') {
    return (
      <StyledActionsContainer>
        <WidgetHeaderCommandMenuItems
          applicationId={widget.applicationId}
          commandMenuItemUniversalIdentifiers={
            headerActionDefinition.commandMenuItemUniversalIdentifiers
          }
        />
      </StyledActionsContainer>
    );
  }

  const HeaderActionComponent = headerActionDefinition.Component;

  return (
    <StyledActionsContainer>
      <HeaderActionComponent widget={widget} />
    </StyledActionsContainer>
  );
};
