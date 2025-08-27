import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { StyledDropdownContentContainer } from '@/ui/layout/dropdown/components/internal/DropdownInternalContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import styled from '@emotion/styled';
import { FloatingPortal, offset, shift, useFloating } from '@floating-ui/react';
import { type ReactNode } from 'react';

type ExpandedListDropdownProps = {
  anchorElement?: HTMLElement;
  children: ReactNode;
  onClickOutside?: () => void;
};

const StyledExpandedListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

// TODO: unify this and use Dropdown component instead
export const ExpandedListDropdown = ({
  anchorElement,
  children,
  onClickOutside,
}: ExpandedListDropdownProps) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
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
    ? Math.max(220, anchorElement.getBoundingClientRect().width)
    : undefined;

  return (
    <FloatingPortal>
      <StyledDropdownContentContainer
        ref={refs.setFloating}
        style={floatingStyles}
      >
        <OverlayContainer>
          <DropdownContent widthInPixels={dropdownContentWidth}>
            <StyledExpandedListContainer>
              {children}
            </StyledExpandedListContainer>
          </DropdownContent>
        </OverlayContainer>
      </StyledDropdownContentContainer>
    </FloatingPortal>
  );
};
