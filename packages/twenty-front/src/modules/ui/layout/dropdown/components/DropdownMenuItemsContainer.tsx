import { DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT } from '@/ui/layout/dropdown/constants/DropdownMenuItemsContainerMaxHeight';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledExternalContainer = styled.div<{
  maxHeight?: number;
}>`
  --padding: ${themeCssVariables.spacing[1]};

  align-items: flex-start;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  height: fit-content;

  max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : 'none')};

  padding: var(--padding);
  width: 100%;
`;

const StyledScrollableContainer = styled.div<{ maxHeight?: number }>`
  box-sizing: border-box;

  display: flex;
  max-height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : 'none')};
  overflow-y: auto;

  scrollbar-color: ${themeCssVariables.border.color.medium} transparent;
  scrollbar-width: 4px;
  width: 100%;

  *::-webkit-scrollbar-thumb {
    border-radius: ${themeCssVariables.border.radius.sm};
  }
`;

const StyledInternalContainer = styled.div`
  display: flex;

  flex-direction: column;
  gap: 2px;

  height: 100%;
  width: 100%;
`;

export const DropdownMenuItemsContainer = ({
  children,
  hasMaxHeight,
  maxHeight,
  scrollable = true,
  className,
}: {
  children: React.ReactNode;
  hasMaxHeight?: boolean;
  // [STRATUM-PATCH] Explicit pixel override used by record-picker surfaces
  // that need more vertical room than the shared 168px default. Wins over
  // hasMaxHeight when provided. See RecordPickerDropdownSize.ts.
  maxHeight?: number;
  scrollable?: boolean;
  className?: string;
}) => {
  const resolvedMaxHeight =
    maxHeight ??
    (hasMaxHeight ? DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT : undefined);

  return scrollable === true ? (
    <StyledScrollableContainer
      className={className}
      maxHeight={resolvedMaxHeight}
    >
      <StyledExternalContainer role="listbox">
        <StyledInternalContainer>{children}</StyledInternalContainer>
      </StyledExternalContainer>
    </StyledScrollableContainer>
  ) : (
    <StyledExternalContainer role="listbox" className={className}>
      <StyledInternalContainer>{children}</StyledInternalContainer>
    </StyledExternalContainer>
  );
};
