import { DropDownMenuItemsScrollContainer } from '@/ui/layout/dropdown/components/DropDownMenuItemsScrollContainer';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { PropsWithChildren } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledDropdownMenuItemsExternalContainer = styled.div<{
  hasMaxHeight?: boolean;
  width: number | 'auto';
}>`
  align-items: flex-start;
  display: flex;

  flex-direction: column;
  max-height: ${({ hasMaxHeight }) => (hasMaxHeight ? '168px' : 'none')};

  ${({ width }) =>
    isDefined(width) &&
    css`
      width: ${width}px;
    `}
`;

const StyledDropdownMenuItemsInternalContainer = styled.div`
  align-items: stretch;
  display: flex;

  flex-direction: column;
  gap: 2px;
  height: 100%;
  width: 100%;
`;


type DropdownMenuItemsContainerProps = PropsWithChildren<{
  hasMaxHeight?: boolean;
  className?: string;
  scrollable?: boolean;
  width?: number | 'auto';
}>;
// TODO: refactor this, the dropdown should handle the max height behavior + scroll with the size middleware
// We should instead create a DropdownMenuItemsContainerScrollable or take for granted that it is the default behavior
export const DropdownMenuItemsContainer = ({
  children,
  hasMaxHeight,
  className,
  width = 200,
  scrollable,
}: DropdownMenuItemsContainerProps) => (
    <DropDownMenuItemsScrollContainer
      hasMaxHeight={hasMaxHeight}
      scrollable={scrollable}
    >
      <StyledDropdownMenuItemsExternalContainer
        className={className}
        role="listbox"
        width={width}
        hasMaxHeight={hasMaxHeight}
      >
        <StyledDropdownMenuItemsInternalContainer>
          {children}
        </StyledDropdownMenuItemsInternalContainer>
      </StyledDropdownMenuItemsExternalContainer>
    </DropDownMenuItemsScrollContainer>
);
