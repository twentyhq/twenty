import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { WIDGET_HEADER_ACTION_COMPONENT_BY_WIDGET_TYPE } from '@/page-layout/widgets/constants/WidgetHeaderActionComponentByWidgetType';
import { useCurrentWidgetOrNull } from '@/page-layout/widgets/hooks/useCurrentWidgetOrNull';
import { WidgetHeaderCommandMenuItems } from '@/page-layout/widgets/widget-card/components/WidgetHeaderCommandMenuItems';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { styled } from '@linaria/react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
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

  // Activity actions create records, so they hide while the layout is being
  // arranged. Field widgets keep their actions: see-all is a read-only link,
  // and edit hides itself through useFieldWidgetActionVisibility.
  if (isPageLayoutInEditMode && widget.type !== WidgetType.FIELD) {
    return null;
  }

  if (
    isWidgetConfigurationOfType(
      widget.configuration,
      'FrontComponentConfiguration',
    ) &&
    isNonEmptyArray(
      widget.configuration.headerCommandMenuItemUniversalIdentifiers,
    )
  ) {
    return (
      <StyledActionsContainer>
        <WidgetHeaderCommandMenuItems
          applicationId={widget.applicationId}
          commandMenuItemUniversalIdentifiers={
            widget.configuration.headerCommandMenuItemUniversalIdentifiers
          }
        />
      </StyledActionsContainer>
    );
  }

  const HeaderActionComponent =
    WIDGET_HEADER_ACTION_COMPONENT_BY_WIDGET_TYPE[widget.type];

  if (!isDefined(HeaderActionComponent)) {
    return null;
  }

  return (
    <StyledActionsContainer>
      <HeaderActionComponent widget={widget} />
    </StyledActionsContainer>
  );
};
