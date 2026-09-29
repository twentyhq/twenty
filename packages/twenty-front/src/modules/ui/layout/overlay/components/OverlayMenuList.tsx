import { styled } from '@linaria/react';
import { type ReactNode, type Ref } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const DEFAULT_MENU_WIDTH = 200;
const DEFAULT_MENU_MAX_HEIGHT = 176;

const StyledContainer = styled.div<{ width: number }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: ${({ width }) => width}px;
`;

const StyledScrollableContainer = styled.div<{ maxHeight?: number | null }>`
  box-sizing: border-box;
  display: flex;
  max-height: ${({ maxHeight }) =>
    isDefined(maxHeight) ? `${maxHeight}px` : 'none'};
  overflow-y: auto;
  scrollbar-color: ${themeCssVariables.border.color.medium} transparent;
  scrollbar-width: thin;
  width: 100%;

  *::-webkit-scrollbar-thumb {
    border-radius: ${themeCssVariables.border.radius.pill};
  }
`;

const StyledItems = styled.div<{ padded: boolean }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  height: fit-content;
  padding: ${({ padded }) => (padded ? themeCssVariables.spacing[1] : 0)};
  width: 100%;
`;

type OverlayMenuListProps = {
  children: ReactNode;
  width?: number;
  maxHeight?: number | null;
  padded?: boolean;
  ref?: Ref<HTMLDivElement>;
};

export const OverlayMenuList = ({
  children,
  width = DEFAULT_MENU_WIDTH,
  maxHeight = DEFAULT_MENU_MAX_HEIGHT,
  padded = true,
  ref,
}: OverlayMenuListProps) => (
  <StyledContainer ref={ref} width={width}>
    <StyledScrollableContainer maxHeight={maxHeight}>
      <StyledItems padded={padded}>{children}</StyledItems>
    </StyledScrollableContainer>
  </StyledContainer>
);
