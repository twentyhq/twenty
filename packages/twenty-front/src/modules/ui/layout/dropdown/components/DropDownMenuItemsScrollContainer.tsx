import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { PropsWithChildren, useId } from 'react';

const StyledScrollWrapper = styled(ScrollWrapper)`
  box-sizing: border-box;
  padding-inline: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledPaddingContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledPaddingBlockContainer = styled.div`
  overflow: auto;
  padding-block: ${({ theme }) => theme.spacing(1)};
`;

type DropDownMenuItemsScrollContainerProps = PropsWithChildren<{
  hasMaxHeight?: boolean;
  scrollable?: boolean;
}>;
export const DropDownMenuItemsScrollContainer = ({
  hasMaxHeight = false,
  scrollable = true,
  children,
}: DropDownMenuItemsScrollContainerProps) => {
  const id = useId();

  if (scrollable || hasMaxHeight) {
    return (
      <StyledPaddingBlockContainer>
        <StyledScrollWrapper
          componentInstanceId={`scroll-wrapper-dropdown-menu-${id}`}
        >
          {children}
        </StyledScrollWrapper>
      </StyledPaddingBlockContainer>
    );
  }

  return <StyledPaddingContainer>{children}</StyledPaddingContainer>;
};
