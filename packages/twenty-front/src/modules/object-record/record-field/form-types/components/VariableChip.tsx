import { extractVariableLabel } from '@/workflow/workflow-variables/utils/extractVariableLabel';
import styled from '@emotion/styled';

import { css, useTheme } from '@emotion/react';
import { IconX, isDefined } from 'twenty-ui';

export const StyledContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledChip = styled.div<{ deletable: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.accent.quaternary};
  border: 1px solid ${({ theme }) => theme.accent.tertiary};
  border-radius: 4px;
  color: ${({ theme }) => theme.color.blue};
  height: 26px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  column-gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(0.5)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  margin-left: ${({ theme }) => theme.spacing(2)};
  user-select: none;
  white-space: nowrap;

  ${({ theme, deletable }) =>
    !deletable &&
    css`
      padding-right: ${theme.spacing(1)};
    `}
`;

const StyledDelete = styled.button`
  box-sizing: border-box;
  height: 20px;
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  user-select: none;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  color: inherit;

  &:hover {
    background-color: ${({ theme }) => theme.accent.secondary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

type VariableChipProps = {
  rawVariableName: string;
  onRemove?: () => void;
};

export const VariableChip = ({
  rawVariableName,
  onRemove,
}: VariableChipProps) => {
  const theme = useTheme();

  return (
    <StyledContainer>
      <StyledChip deletable={isDefined(onRemove)}>
        {extractVariableLabel(rawVariableName)}

        {onRemove ? (
          <StyledDelete onClick={onRemove}>
            <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
          </StyledDelete>
        ) : null}
      </StyledChip>
    </StyledContainer>
  );
};
