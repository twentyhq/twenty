import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div<{
  onClick?: () => void;
  isWidgetRestricted?: boolean;
  isPageLayoutInEditMode?: boolean;
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

  ${({ onClick, theme, isPageLayoutInEditMode }) =>
    isPageLayoutInEditMode &&
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
};

export const WidgetContainer = ({
  children,
  onClick,
}: WidgetContainerProps) => {
  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  return (
    <StyledContainer
      onClick={onClick}
      isPageLayoutInEditMode={isPageLayoutInEditMode}
    >
      {children}
    </StyledContainer>
  );
};
