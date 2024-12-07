import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { FloatingPortal, offset, shift, useFloating } from '@floating-ui/react';
import { ReactNode } from 'react';

import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

type ExpandedListDropdownProps = {
  anchorElement?: HTMLElement;
  children: ReactNode;
  onClickOutside?: () => void;
  withBorder?: boolean;
};

const StyledExpandedListContainer = styled.div<{
  withBorder?: boolean;
}>`
  backdrop-filter: ${({ theme }) => theme.blur.strong};
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) =>
    `0px 2px 4px ${theme.boxShadow.light}, 2px 4px 16px ${theme.boxShadow.strong}`};
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
      <DropdownMenu
        ref={refs.setFloating}
        style={floatingStyles}
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
    </FloatingPortal>
  );
};
