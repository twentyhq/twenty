import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div<{
  onClick?: () => void;
  showHover?: boolean;
}>`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  padding: ${({ theme }) => theme.spacing(4)};

  ${({ showHover, onClick, theme }) =>
    showHover &&
    `
    &:hover {
      cursor: ${isDefined(onClick) ? 'pointer' : 'default'};
      border: 1px solid ${theme.color.blue};
      background: ${theme.background.primary};
    }
  `}
`;

type WidgetContainerProps = {
  children?: ReactNode;
  onClick?: () => void;
  isRestricted?: boolean;
};

export const WidgetContainer = ({
  children,
  onClick,
  isRestricted = false,
}: WidgetContainerProps) => {
  const isPageLayoutInEditModeComponent = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );
  const showHover = !isRestricted || isPageLayoutInEditModeComponent;

  return (
    <StyledContainer onClick={onClick} showHover={showHover}>
      {children}
    </StyledContainer>
  );
};
