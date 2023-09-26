import { type HTMLAttributes, useRef } from 'react';
import styled from '@emotion/styled';

import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

const StyledDropdownMenuContainer = styled.ul<{
  anchor: 'left' | 'right';
}>`
  padding: 0;
  position: absolute;
  ${({ anchor }) => {
    if (anchor === 'right') return 'right: 0';
  }};
  top: 14px;
`;

export type DropdownMenuContainerProps = {
  anchor?: 'left' | 'right';
  children: React.ReactNode;
  onClose?: () => void;
  width?: `${string}px` | 'auto' | number;
} & HTMLAttributes<HTMLUListElement>;

export const DropdownMenuContainer = ({
  anchor = 'right',
  children,
  onClose,
  width,
  ...props
}: DropdownMenuContainerProps) => {
  const dropdownRef = useRef(null);

  useListenClickOutside({
    refs: [dropdownRef],
    callback: () => {
      onClose?.();
    },
  });

  return (
    // eslint-disable-next-line twenty/no-spread-props
    <StyledDropdownMenuContainer data-select-disable {...props} anchor={anchor}>
      <StyledDropdownMenu ref={dropdownRef} width={width}>
        {children}
      </StyledDropdownMenu>
    </StyledDropdownMenuContainer>
  );
};
