import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import styled from '@emotion/styled';
import { type Ref, forwardRef } from 'react';

const StyledInternalBaseDropdownContent = styled.div<{
  widthInPixels: number;
}>`
  display: flex;

  flex-direction: column;
  height: 100%;
  width: ${({ widthInPixels }) => widthInPixels}px;
`;

export const DropdownContent = forwardRef(
  (
    {
      children,
      widthInPixels = GenericDropdownContentWidth.Medium,
      selectDisabled = false,
    }: React.PropsWithChildren<{
      widthInPixels?: number;
      selectDisabled?: boolean;
    }>,
    ref: Ref<HTMLDivElement>,
  ) => {
    return (
      <StyledInternalBaseDropdownContent
        data-select-disable={selectDisabled}
        widthInPixels={widthInPixels}
        ref={ref}
      >
        {children}
      </StyledInternalBaseDropdownContent>
    );
  },
);
