import { useWorkflowStepContextOrThrow } from '@/workflow/states/context/WorkflowStepContext';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { extractRawVariableNamePart } from '@/workflow/workflow-variables/utils/extractRawVariableNamePart';
import { searchVariableThroughOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchema';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconAlertTriangle, IconX } from 'twenty-ui/display';

const StyledChip = styled.div<{ deletable: boolean; danger: boolean }>`
  background-color: ${({ theme, danger }) =>
    danger ? theme.adaptiveColors.red1 : theme.adaptiveColors.blue1};
  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme, danger }) =>
    danger ? theme.adaptiveColors.red2 : theme.adaptiveColors.blue2};
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

const StyledLabel = styled.span<{ danger: boolean }>`
  color: ${({ theme, danger }) =>
    danger ? theme.color.red : theme.color.blue};
  line-height: 140%;
`;

const StyledDelete = styled.button<{ danger: boolean }>`
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
  color: ${({ theme, danger }) =>
    danger ? theme.color.red : theme.color.blue};
  border-top-right-radius: ${({ theme }) => theme.border.radius.sm};
  border-bottom-right-radius: ${({ theme }) => theme.border.radius.sm};

  &:hover {
    background-color: ${({ theme, danger }) =>
      danger ? theme.adaptiveColors.red2 : theme.adaptiveColors.blue2};
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
  const { t } = useLingui();
  const { workflowVersionId } = useWorkflowStepContextOrThrow();

  const stepId = extractRawVariableNamePart({
    rawVariableName,
    part: 'stepId',
  });
  const stepsOutputSchema = useRecoilValue(
    stepsOutputSchemaFamilySelector({
      workflowVersionId,
      stepIds: [stepId],
    }),
  );

  if (!isDefined(stepId)) {
    return null;
  }

  const { variableLabel, variablePathLabel } =
    searchVariableThroughOutputSchema({
      stepOutputSchema: stepsOutputSchema?.[0],
      rawVariableName,
      isFullRecord,
    });

  const isVariableNotFound = !isDefined(variableLabel);
  const label = isVariableNotFound ? t`Not Found` : variableLabel;
  const title = isVariableNotFound ? t`Variable not found` : variablePathLabel;

  return (
    <StyledChip deletable={isDefined(onRemove)} danger={isVariableNotFound}>
      {!isDefined(variableLabel) && (
        <IconAlertTriangle
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
          color={theme.color.red}
        />
      )}
      <StyledLabel title={title} danger={isVariableNotFound}>
        {label}
      </StyledLabel>

      {onRemove ? (
        <StyledDelete
          onClick={onRemove}
          aria-label="Remove variable"
          danger={isVariableNotFound}
        >
          <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        </StyledDelete>
      ) : null}
    </StyledChip>
  );
};
