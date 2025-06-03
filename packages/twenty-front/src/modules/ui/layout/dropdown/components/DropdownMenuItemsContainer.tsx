import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledDropdownMenuItemsExternalContainer = styled.div<{
  hasMaxHeight?: boolean;
  width: number | 'auto' | '100%';
}>`
  --padding: ${({ theme }) => theme.spacing(1)};

  align-items: flex-start;
  display: flex;

  flex-direction: column;
  max-height: ${({ hasMaxHeight }) => (hasMaxHeight ? '168px' : 'none')};

  padding: var(--padding);

  ${({ width }) =>
    isDefined(width) && width === '100%'
      ? css`
          width: 100%;
        `
      : css`
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

const StyledScrollWrapper = styled(ScrollWrapper)`
  width: 100%;
`;

export const DropdownMenuItemsContainer = ({
  children,
  hasMaxHeight,
  className,
  scrollable = true,
  width = 'auto',
}: {
  children: React.ReactNode;
  hasMaxHeight?: boolean;
  className?: string;
  scrollable?: boolean;
  width?: number | 'auto' | '100%';
}) => {
  const id = useId();

  return scrollable !== true ? (
    <StyledDropdownMenuItemsExternalContainer
      hasMaxHeight={hasMaxHeight}
      className={className}
      role="listbox"
      width={width}
    >
      {hasMaxHeight ? (
        <StyledScrollWrapper
          componentInstanceId={`scroll-wrapper-dropdown-menu-${id}`}
        >
          <StyledDropdownMenuItemsInternalContainer>
            {children}
          </StyledDropdownMenuItemsInternalContainer>
        </StyledScrollWrapper>
      ) : (
        <StyledDropdownMenuItemsInternalContainer>
          {children}
        </StyledDropdownMenuItemsInternalContainer>
      )}
    </StyledDropdownMenuItemsExternalContainer>
  ) : (
    <ScrollWrapper componentInstanceId={`scroll-wrapper-dropdown-menu-${id}`}>
      <StyledDropdownMenuItemsExternalContainer
        hasMaxHeight={hasMaxHeight}
        className={className}
        role="listbox"
        width={width}
      >
        <StyledDropdownMenuItemsInternalContainer>
          {children}
        </StyledDropdownMenuItemsInternalContainer>
      </StyledDropdownMenuItemsExternalContainer>
    </ScrollWrapper>
  );
};
