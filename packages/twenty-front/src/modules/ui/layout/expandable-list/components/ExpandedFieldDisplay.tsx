import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { styled } from '@linaria/react';
import { flip, FloatingPortal, offset, useFloating } from '@floating-ui/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type ExpandedFieldDisplayProps = {
  anchorElement?: HTMLElement;
  children: ReactNode;
  onClickOutside?: () => void;
};

const StyledExpandedFieldContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  height: 300px;
  overflow: auto;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
  position: relative;
  width: 400px;
`;

const StyledContainer = styled.div`
  display: flex;
  z-index: ${RootStackingContextZIndices.DropdownPortalBelowModal};
`;

export const ExpandedFieldDisplay = ({
  anchorElement,
  children,
  onClickOutside,
}: ExpandedFieldDisplayProps) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [
      flip(),
      offset({
        mainAxis: -29,
        crossAxis: -10,
      }),
    ],
    elements: { reference: anchorElement },
  });

  useListenClickOutside({
    refs: [refs.domReference, refs.floating],
    callback: () => {
      onClickOutside?.();
    },
    listenerId: 'expanded-field-display',
  });

  return (
    <FloatingPortal>
      <StyledContainer
        ref={refs.setFloating}
        style={floatingStyles}
        data-globally-prevent-click-outside="true"
      >
        <OverlayContainer>
          <StyledExpandedFieldContainer>
            {children}
          </StyledExpandedFieldContainer>
        </OverlayContainer>
      </StyledContainer>
    </FloatingPortal>
  );
};
