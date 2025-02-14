import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { FloatingPortal, offset, shift, useFloating } from '@floating-ui/react';
import { ReactNode } from 'react';

import { StyledDropdownContentContainer } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';

type ExpandedListDropdownProps = {
  anchorElement?: HTMLElement;
  children: ReactNode;
  onClickOutside?: () => void;
  withBorder?: boolean;
};

const StyledExpandedListContainer = styled.div<{
  withBorder?: boolean;
}>`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};

  ${({ theme, withBorder }) =>
    withBorder &&
    css`
      outline: 1px solid ${theme.font.color.extraLight};
    `};
`;

// TODO: unify this and use Dropdown component instead
export const ExpandedListDropdown = ({
  anchorElement,
  children,
  onClickOutside,
  withBorder,
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

  return (
    <FloatingPortal>
      <StyledDropdownContentContainer
        ref={refs.setFloating}
        style={floatingStyles}
      >
        <OverlayContainer>
          <DropdownMenu
            width={
              anchorElement
                ? Math.max(220, anchorElement.getBoundingClientRect().width)
                : undefined
            }
          >
            <StyledExpandedListContainer withBorder={withBorder}>
              {children}
            </StyledExpandedListContainer>
          </DropdownMenu>
        </OverlayContainer>
      </StyledDropdownContentContainer>
    </FloatingPortal>
  );
};
