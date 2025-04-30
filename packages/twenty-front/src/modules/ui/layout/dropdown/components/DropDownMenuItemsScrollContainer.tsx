import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { PropsWithChildren, useId } from 'react';

const StyledScrollWrapper = styled(ScrollWrapper)`
  width: 100%;
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
      <StyledScrollWrapper
        componentInstanceId={`scroll-wrapper-dropdown-menu-${id}`}
      >
        {children}
      </StyledScrollWrapper>
    );
  }

  return children;
};
