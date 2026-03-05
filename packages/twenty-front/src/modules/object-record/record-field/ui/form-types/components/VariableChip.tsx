import { BaseChip } from '@/object-record/record-field/ui/form-types/components/BaseChip';
import { useSearchVariable } from '@/workflow/workflow-variables/hooks/useSearchVariable';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { extractRawVariableNamePart } from 'twenty-shared/workflow';
import { IconAlertTriangle } from 'twenty-ui/display';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

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
            size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.sm)}
            stroke={resolveThemeVariableAsNumber(
              themeCssVariables.icon.stroke.sm,
            )}
            color={resolveThemeVariable(themeCssVariables.color.red)}
          />
        ) : undefined
      }
    />
  );
};
