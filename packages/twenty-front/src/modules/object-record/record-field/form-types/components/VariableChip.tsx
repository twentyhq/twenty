import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { extractRawVariableNamePart } from '@/workflow/workflow-variables/utils/extractRawVariableNamePart';
import { searchVariableThroughOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchema';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';
import { IconX } from 'twenty-ui';

const StyledChip = styled.div<{ deletable: boolean }>`
  background-color: ${({ theme }) => theme.accent.quaternary};
  border: 1px solid ${({ theme }) => theme.accent.tertiary};
  border-radius: 4px;
  height: 20px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  flex-direction: row;
  flex-shrink: 0;
  column-gap: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  user-select: none;
  white-space: nowrap;

  ${({ theme, deletable }) =>
    !deletable
      ? css`
          padding-right: ${theme.spacing(1)};
        `
      : css`
          cursor: pointer;
        `}
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.color.blue};
  line-height: 140%;
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
  color: ${({ theme }) => theme.color.blue};
  border-top-right-radius: ${({ theme }) => theme.border.radius.sm};
  border-bottom-right-radius: ${({ theme }) => theme.border.radius.sm};

  &:hover {
    background-color: ${({ theme }) => theme.accent.secondary};
  }
`;

type VariableChipProps = {
  rawVariableName: string;
  onRemove?: () => void;
  isFullRecord?: boolean;
};

export const VariableChip = ({
  rawVariableName,
  onRemove,
  isFullRecord = false,
}: VariableChipProps) => {
  const theme = useTheme();
  const { getStepsOutputSchema } = useStepsOutputSchema({});
  const stepId = extractRawVariableNamePart({
    rawVariableName,
    part: 'stepId',
  });

  if (!isDefined(stepId)) {
    return null;
  }

  const stepOutputSchema = getStepsOutputSchema([stepId])?.[0];

  if (!isDefined(stepOutputSchema)) {
    return null;
  }

  const { variableLabel, variablePathLabel } =
    searchVariableThroughOutputSchema({
      stepOutputSchema,
      rawVariableName,
      isFullRecord,
    });

  const label = isDefined(variableLabel)
    ? variableLabel
    : extractRawVariableNamePart({
        rawVariableName,
        part: 'selectedField',
      });

  return (
    <StyledChip deletable={isDefined(onRemove)}>
      <StyledLabel title={variablePathLabel}>{label}</StyledLabel>

      {onRemove ? (
        <StyledDelete onClick={onRemove} aria-label="Remove variable">
          <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        </StyledDelete>
      ) : null}
    </StyledChip>
  );
};
