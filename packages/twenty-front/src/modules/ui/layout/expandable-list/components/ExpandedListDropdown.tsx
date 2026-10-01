import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { StyledOverlayPortalLayer } from '@/ui/layout/overlay/components/StyledOverlayPortalLayer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { styled } from '@linaria/react';
import { FloatingPortal, offset, shift, useFloating } from '@floating-ui/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

type ExpandedListDropdownProps = {
  anchorElement?: HTMLElement;
  children: ReactNode;
  onClickOutside?: () => void;
};

const StyledExpandedListContainer = styled.div<{ widthInPixels: number }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]};
  width: ${({ widthInPixels }) => widthInPixels}px;
`;

// TODO: unify this and use Dropdown component instead
export const ExpandedListDropdown = ({
  anchorElement,
  children,
  onClickOutside,
}: ExpandedListDropdownProps) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset({ mainAxis: -9, crossAxis: -7 }), shift()],
    elements: { reference: anchorElement },
  });

  useListenClickOutside({
    refs: [refs.domReference],
    callback: () => {
      onClickOutside?.();
    },
    listenerId: 'expandable-list',
  });

  const dropdownContentWidth = anchorElement
    ? Math.max(220, anchorElement.offsetWidth)
    : GenericDropdownContentWidth.Medium;

  return (
    <FloatingPortal>
      <StyledOverlayPortalLayer
        data-floating-ui-viewport
        ref={refs.setFloating}
        style={floatingStyles}
      >
        <OverlayContainer>
          <StyledExpandedListContainer widthInPixels={dropdownContentWidth}>
            {children}
          </StyledExpandedListContainer>
        </OverlayContainer>
      </StyledOverlayPortalLayer>
    </FloatingPortal>
  );
};
