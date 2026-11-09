import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useIsMobile } from 'twenty-ui/utilities';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHoverReveal = styled.div<{ isVisible: boolean }>`
  opacity: ${({ isVisible }) => (isVisible ? '1' : '0')};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  transition: opacity ${themeCssVariables.animation.duration.instant}s ease;

  &:focus-within {
    opacity: 1;
    pointer-events: auto;
  }
`;

type WidgetCardHeaderHoverRevealProps = {
  children: ReactNode;
  isAlwaysVisible?: boolean;
};

// Touch devices have no hover, so the content stays visible on mobile.
export const WidgetCardHeaderHoverReveal = ({
  children,
  isAlwaysVisible,
}: WidgetCardHeaderHoverRevealProps) => {
  const widgetComponentInstanceId = useComponentInstanceStateContext(
    WidgetComponentInstanceContext,
  );
  const isMobile = useIsMobile();

  const widgetCardHovered = useAtomComponentFamilyStateValue(
    widgetCardHoveredComponentFamilyState,
    widgetComponentInstanceId?.instanceId ?? '',
  );

  return (
    <StyledHoverReveal
      isVisible={(isAlwaysVisible ?? isMobile) || widgetCardHovered}
    >
      {children}
    </StyledHoverReveal>
  );
};
