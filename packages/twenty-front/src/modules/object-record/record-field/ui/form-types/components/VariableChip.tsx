import { BaseChip } from '@/ui/input/components/BaseChip';
import { useSearchVariable } from '@/workflow/workflow-variables/hooks/useSearchVariable';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { extractRawVariableNamePart } from 'twenty-shared/workflow';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

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
  const { t } = useLingui();
  const theme = useTheme();

  const { variableLabel, variablePathLabel } = useSearchVariable({
    stepId: extractRawVariableNamePart({
      rawVariableName,
      part: 'stepId',
    }),
    rawVariableName,
    isFullRecord,
  });

  const isVariableNotFound = !isDefined(variableLabel);
  const label = isVariableNotFound ? t`Not Found` : variableLabel;
  const title = isVariableNotFound ? t`Variable not found` : variablePathLabel;

  return (
    <BaseChip
      label={label}
      title={title}
      onRemove={onRemove}
      removeAriaLabel={t`Remove variable`}
      danger={isVariableNotFound}
      leftIcon={
        isVariableNotFound ? (
          <IconAlertTriangle
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.sm}
            color={theme.color.red}
          />
        ) : undefined
      }
    />
  );
};
